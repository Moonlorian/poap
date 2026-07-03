import { Address, Transaction } from '@multiversx/sdk-core';
import {
  GAS_PRICE,
  getAccountProvider,
  refreshAccount,
  TransactionManager,
  useGetAccount,
  useGetNetworkConfig
} from '@/lib';

export const useSendToSelfTransaction = () => {
  const { address, nonce } = useGetAccount();
  const { network } = useGetNetworkConfig();

  const sendToSelfTransaction = async () => {
    try {
      // Refresh account to get latest nonce
      await refreshAccount();

      // Create transaction to send to self
      const transaction = new Transaction({
        nonce: BigInt(nonce),
        value: BigInt(0),
        sender: Address.newFromBech32(address),
        receiver: Address.newFromBech32(address), // Send to self
        gasLimit: BigInt(50_000),
        gasPrice: BigInt(GAS_PRICE),
        chainID: network.chainId,
        version: 1
      });

      // Get the account provider and sign the transaction
      const provider = getAccountProvider();
      const signedTransactions = await provider.signTransactions([transaction]);

      if (!signedTransactions || signedTransactions.length === 0) {
        throw new Error('Transaction signing failed');
      }

      // Send the signed transaction
      const transactionManager = TransactionManager.getInstance();
      const sentTransactions =
        await transactionManager.send(signedTransactions);

      if (!sentTransactions || sentTransactions.length === 0) {
        throw new Error('Transaction sending failed');
      }

      // Track the transaction with custom messages
      transactionManager.track(sentTransactions, {
        transactionsDisplayInfo: {
          processingMessage: `Sending transaction...`,
          errorMessage: 'Failed to send transaction',
          successMessage: `Successfully sent transaction!`
        }
      });

      // Return the transaction hash
      return sentTransactions[0].hash;
    } catch (error) {
      console.error('Error sending transaction to self:', error);
      throw error;
    }
  };

  return { sendToSelfTransaction };
};
