import {
  AbiRegistry,
  Account,
  Address,
  ProxyNetworkProvider,
  SmartContractController,
  SmartContractTransactionsFactory,
  TransactionsFactoryConfig,
  UserSigner
} from '@multiversx/sdk-core';
import {
  GAS_PRICE,
  getAccountProvider,
  refreshAccount,
  TransactionManager,
  useGetAccount,
  useGetNetworkConfig
} from '@/lib';
import { chainId, contractAddress, PROXY_URL } from '@/config';
import poapAbi from './poap-sc.abi.json';

const GAS_LIMIT_CREATE = 10_000_000n;
const GAS_LIMIT_CLAIM = 10_000_000n;
const GAS_LIMIT_FINALIZE = 10_000_000n;

const abi = AbiRegistry.create(poapAbi);

const getNetworkProvider = () =>
  new ProxyNetworkProvider(PROXY_URL, { clientName: 'poap-dapp' });

const getController = () =>
  new SmartContractController({
    chainID: chainId,
    networkProvider: getNetworkProvider(),
    abi
  });

const getFactory = () =>
  new SmartContractTransactionsFactory({
    config: new TransactionsFactoryConfig({ chainID: chainId }),
    abi
  });

const getContractAddress = () => Address.newFromBech32(contractAddress);

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

export const parseEvent = (raw) => {
  if (!raw) return null;

  const event = raw.valueOf ? raw.valueOf() : raw;

  if (!event || typeof event !== 'object') return null;

  return {
    name: event.name?.toString?.() ?? String(event.name ?? ''),
    emblemUrl: event.emblem_url?.toString?.() ?? String(event.emblem_url ?? ''),
    startDate: Number(event.start_date ?? event.startDate ?? 0),
    endDate: Number(event.end_date ?? event.endDate ?? 0),
    isStopped: Boolean(event.is_stopped ?? event.isStopped),
    maxParticipants: Number(event.max_participants ?? event.maxParticipants ?? 0),
    currentParticipants: Number(
      event.current_participants ?? event.currentParticipants ?? 0
    ),
    tokenNonce: Number(event.token_nonce ?? event.tokenNonce ?? 0),
    organizer: event.organizer?.toString?.() ?? String(event.organizer ?? '')
  };
};

// ---------------------------------------------------------------------------
// Queries (readonly)
// ---------------------------------------------------------------------------

export const getActiveEvent = async (organizerAddress) => {
  const controller = getController();
  const result = await controller.query({
    contract: getContractAddress(),
    function: 'getActiveEvent',
    arguments: [Address.newFromBech32(organizerAddress)]
  });

  if (!result || result.length === 0) return null;

  const first = result[0];
  if (first == null || first === '') return null;

  return parseEvent(first);
};

/**
 * Checks whether a given address has already claimed the emblem for an event.
 * @param {number|bigint} eventId  - token nonce / event ID from the active event
 * @param {string} address         - bech32 address to check
 * @returns {Promise<boolean>}
 */
export const hasClaimed = async (eventId, address) => {
  const controller = getController();
  const result = await controller.query({
    contract: getContractAddress(),
    function: 'hasClaimed',
    arguments: [BigInt(eventId), Address.newFromBech32(address)]
  });

  if (!result || result.length === 0) return false;

  const value = result[0];
  // sdk-core returns a BooleanValue; unwrap it safely
  return value?.valueOf?.() ?? Boolean(value);
};

// ---------------------------------------------------------------------------
// PEM helpers
// ---------------------------------------------------------------------------

export const createAccountFromPem = (pem) => {
  const signer = UserSigner.fromPem(pem.trim());
  return new Account(signer.secretKey);
};

export const getAddressFromPem = (pem) => {
  const signer = UserSigner.fromPem(pem.trim());
  return signer.getAddress().toBech32();
};

export const validatePem = (pem) => {
  try {
    getAddressFromPem(pem);
    return true;
  } catch {
    return false;
  }
};

// ---------------------------------------------------------------------------
// Transaction sending (connected wallet)
// ---------------------------------------------------------------------------

export const sendSignedTransactions = async (signedTransactions, messages) => {
  const transactionManager = TransactionManager.getInstance();
  const sentTransactions = await transactionManager.send(signedTransactions);

  if (!sentTransactions?.length) {
    throw new Error('Transaction sending failed');
  }

  transactionManager.track(sentTransactions, {
    transactionsDisplayInfo: messages
  });

  return sentTransactions[0].hash;
};

export const signAndSendWithProvider = async (transaction, messages) => {
  const provider = getAccountProvider();
  const signedTransactions = await provider.signTransactions([transaction]);

  if (!signedTransactions?.length) {
    throw new Error('Transaction signing failed');
  }

  return sendSignedTransactions(signedTransactions, messages);
};

// ---------------------------------------------------------------------------
// Transaction builders (connected wallet)
// ---------------------------------------------------------------------------

export const createEventTransaction = ({ senderAddress, name, url, endDate, maxParticipants }) => {
  const factory = getFactory();
  return factory.createTransactionForExecute(Address.newFromBech32(senderAddress), {
    contract: getContractAddress(),
    function: 'createEvent',
    arguments: [name, url, BigInt(endDate), BigInt(maxParticipants)],
    gasLimit: GAS_LIMIT_CREATE
  });
};

export const finalizeEventTransaction = ({ senderAddress }) => {
  const factory = getFactory();
  return factory.createTransactionForExecute(Address.newFromBech32(senderAddress), {
    contract: getContractAddress(),
    function: 'finalizeEvent',
    arguments: [],
    gasLimit: GAS_LIMIT_FINALIZE
  });
};

// ---------------------------------------------------------------------------
// claimEmblem — signed with organizer PEM (not connected wallet)
// ---------------------------------------------------------------------------

/**
 * Signs and sends a claimEmblem transaction using the organizer's PEM key.
 * The organizer (sender) pays the gas; the recipient receives the NFT.
 *
 * @param {{ pem: string, recipientAddress: string }} params
 * @returns {Promise<string>} transaction hash
 */
export const claimEmblemWithPem = async ({ pem, recipientAddress }) => {
  const signer = UserSigner.fromPem(pem.trim());
  const organizerAddress = signer.getAddress();

  const provider = getNetworkProvider();

  // Fetch on-chain nonce for the organizer account
  const accountOnNetwork = await provider.getAccount(organizerAddress);
  const nonce = BigInt(accountOnNetwork.nonce);

  // Build the transaction using the factory (same pattern as other transactions)
  const factory = getFactory();
  const transaction = factory.createTransactionForExecute(organizerAddress, {
    contract: getContractAddress(),
    function: 'claimEmblem',
    arguments: [Address.newFromBech32(recipientAddress)],
    gasLimit: GAS_LIMIT_CLAIM
  });

  // Set fields the factory leaves blank
  transaction.nonce = nonce;
  transaction.chainID = chainId;
  transaction.gasPrice = BigInt(GAS_PRICE);

  // Sign with the PEM key
  const serialized = transaction.serializeForSigning();
  const signature = await signer.sign(serialized);
  transaction.applySignature(signature);

  // Broadcast and wait for finality
  const txHash = await provider.sendTransaction(transaction);
  await provider.awaitTransactionCompleted(txHash);

  return txHash;
};

// ---------------------------------------------------------------------------
// React hook — connected wallet transactions
// ---------------------------------------------------------------------------

export const usePoapTransactions = () => {
  const { address, nonce } = useGetAccount();
  const { network } = useGetNetworkConfig();

  const sendCreateEvent = async ({ name, url, endDate, maxParticipants }) => {
    await refreshAccount();
    const transaction = createEventTransaction({
      senderAddress: address,
      name,
      url,
      endDate,
      maxParticipants
    });
    transaction.nonce = BigInt(nonce);
    transaction.chainID = network.chainId;
    transaction.gasPrice = BigInt(GAS_PRICE);

    return signAndSendWithProvider(transaction, {
      processingMessage: 'Creant classe...',
      errorMessage: 'Error en crear la classe',
      successMessage: 'Classe creada correctament!'
    });
  };

  const sendFinalizeEvent = async () => {
    await refreshAccount();
    const transaction = finalizeEventTransaction({ senderAddress: address });
    transaction.nonce = BigInt(nonce);
    transaction.chainID = network.chainId;
    transaction.gasPrice = BigInt(GAS_PRICE);

    return signAndSendWithProvider(transaction, {
      processingMessage: 'Finalitzant classe...',
      errorMessage: 'Error en finalitzar la classe',
      successMessage: 'Classe finalitzada!'
    });
  };

  return { sendCreateEvent, sendFinalizeEvent };
};