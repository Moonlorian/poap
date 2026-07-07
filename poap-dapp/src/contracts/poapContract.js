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
import { UserWallet } from '@multiversx/sdk-wallet';

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
    eventId: Number(event.event_id ?? event.eventId ?? 0),
    name: event.name?.toString?.() ?? String(event.name ?? ''),
    emblemUrl: event.emblem_url?.toString?.() ?? String(event.emblem_url ?? ''),
    startDate: Number(event.start_date ?? event.startDate ?? 0),
    endDate: Number(event.end_date ?? event.endDate ?? 0),
    isStopped: Boolean(event.is_stopped ?? event.isStopped),
    maxParticipants: Number(event.max_participants ?? event.maxParticipants ?? 0),
    currentParticipants: Number(event.current_participants ?? event.currentParticipants ?? 0),
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

export const hasClaimed = async (eventId, address) => {
  const controller = getController();
  const result = await controller.query({
    contract: getContractAddress(),
    function: 'hasClaimed',
    arguments: [BigInt(eventId), Address.newFromBech32(address)]
  });
  if (!result || result.length === 0) return false;
  const value = result[0];
  return value?.valueOf?.() ?? Boolean(value);
};

export const getAddressFromPem = (pem) => {
  const signer = UserSigner.fromPem(pem.trim());
  return signer.getAddress().bech32();
};

export const validatePem = (pem) => {
  try {
    getAddressFromPem(pem);
    return true;
  } catch {
    return false;
  }
};

const bytesToHex = (bytes) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const bytesToBase64 = (bytes) => {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

export const getAddressFromKeystore = (keystoreJson, password) => {
  const secretKey = decryptKeystoreSecretKey(keystoreJson, password);
  const signer = new UserSigner(secretKey);
  return signer.getAddress().bech32();
};

const decryptKeystoreSecretKey = (keystoreJson, password) => {
  try {
    if (keystoreJson.kind === 'mnemonic') {
      const mnemonic = UserWallet.decryptMnemonic(keystoreJson, password);
      return mnemonic.deriveKey(0);
    }
    return UserWallet.decryptSecretKey(keystoreJson, password);
  } catch (err) {
    if (err?.message?.includes('MAC mismatch')) {
      throw new Error('Contrasenya incorrecta. Torna-ho a intentar.');
    }
    throw new Error(`Error desxifrant el wallet: ${err?.message ?? err}`);
  }
};

export const decryptKeystoreToPem = (keystoreJson, password) => {
  const secretKey = decryptKeystoreSecretKey(keystoreJson, password);
  let userAddress;
  try {
    const signer = new UserSigner(secretKey);
    userAddress = signer.getAddress();
  } catch (signerErr) {
    userAddress = secretKey.generatePublicKey().toAddress();
  }
  const bech32 = userAddress.bech32();

  const secretHex = bytesToHex(secretKey.valueOf());
  const pubkeyHex = bytesToHex(userAddress.pubkey());
  const combinedHexAsText = secretHex + pubkeyHex; // 128-char ascii string

  const asciiBytes = new TextEncoder().encode(combinedHexAsText);
  const pemBody = bytesToBase64(asciiBytes).match(/.{1,64}/g).join('\n');

  return `-----BEGIN PRIVATE KEY for ${bech32}-----\n${pemBody}\n-----END PRIVATE KEY for ${bech32}-----`;
};

export const sendSignedTransactions = async (signedTransactions, messages) => {
  const transactionManager = TransactionManager.getInstance();
  const sentTransactions = await transactionManager.send(signedTransactions);
  if (!sentTransactions?.length) throw new Error('Transaction sending failed');
  transactionManager.track(sentTransactions, { transactionsDisplayInfo: messages });
  return sentTransactions[0].hash;
};

export const signAndSendWithProvider = async (transaction, messages) => {
  const provider = getAccountProvider();
  const signedTransactions = await provider.signTransactions([transaction]);
  if (!signedTransactions?.length) throw new Error('Transaction signing failed');
  return sendSignedTransactions(signedTransactions, messages);
};

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

export const claimEmblemWithPem = async ({ pem, recipientAddress }) => {
  const signer = UserSigner.fromPem(pem.trim());
  const organizerAddress = signer.getAddress();

  const provider = getNetworkProvider();
  const accountOnNetwork = await provider.getAccount(organizerAddress);
  const nonce = BigInt(accountOnNetwork.nonce);

  const factory = getFactory();
  const transaction = factory.createTransactionForExecute(organizerAddress, {
    contract: getContractAddress(),
    function: 'claimEmblem',
    arguments: [Address.newFromBech32(recipientAddress)],
    gasLimit: GAS_LIMIT_CLAIM
  });

  transaction.nonce = nonce;
  transaction.chainID = chainId;
  transaction.gasPrice = BigInt(GAS_PRICE);

  const serialized = transaction.serializeForSigning();
  const signature = await signer.sign(serialized);
  transaction.applySignature(signature);

  const txHash = await provider.sendTransaction(transaction);
  await provider.awaitTransactionCompleted(txHash);
  return txHash;
};

export const usePoapTransactions = () => {
  const { address, nonce } = useGetAccount();
  const { network } = useGetNetworkConfig();

  const sendCreateEvent = async ({ name, url, endDate, maxParticipants }) => {
    await refreshAccount();
    const transaction = createEventTransaction({ senderAddress: address, name, url, endDate, maxParticipants });
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