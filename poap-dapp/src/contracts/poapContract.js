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

export const createEventTransaction = async ({
  senderAddress,
  nonce,
  name,
  url,
  endDate,
  maxParticipants
}) => {
  const factory = getFactory();
  return factory.createTransactionForExecute(Address.newFromBech32(senderAddress), {
    contract: getContractAddress(),
    function: 'createEvent',
    arguments: [name, url, endDate, maxParticipants],
    gasLimit: GAS_LIMIT_CREATE
  });
};

export const finalizeEventTransaction = async ({ senderAddress, nonce }) => {
  const factory = getFactory();
  return factory.createTransactionForExecute(Address.newFromBech32(senderAddress), {
    contract: getContractAddress(),
    function: 'finalizeEvent',
    arguments: [],
    gasLimit: GAS_LIMIT_FINALIZE
  });
};

export const claimEmblemWithPem = async ({ pem, recipientAddress }) => {
  const account = createAccountFromPem(pem);
  const provider = getNetworkProvider();
  const accountOnNetwork = await provider.getAccount(account.address);
  account.nonce = BigInt(accountOnNetwork.nonce);

  const controller = getController();
  const transaction = await controller.createTransactionForExecute(
    account,
    account.nonce,
    {
      contract: getContractAddress(),
      function: 'claimEmblem',
      arguments: [Address.newFromBech32(recipientAddress)],
      gasLimit: GAS_LIMIT_CLAIM
    }
  );

  const txHash = await provider.sendTransaction(transaction);
  await provider.awaitTransactionCompleted(txHash);
  return txHash;
};

export const usePoapTransactions = () => {
  const { address, nonce } = useGetAccount();
  const { network } = useGetNetworkConfig();

  const sendCreateEvent = async ({ name, url, endDate, maxParticipants }) => {
    await refreshAccount();
    const transaction = await createEventTransaction({
      senderAddress: address,
      nonce,
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
    const transaction = await finalizeEventTransaction({
      senderAddress: address,
      nonce
    });
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
