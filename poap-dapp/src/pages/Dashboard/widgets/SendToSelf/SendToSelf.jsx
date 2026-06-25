import { useState } from 'react';
import { faArrowRight, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Label, OutputContainer } from '@/components';
import {
  useGetAccount,
  useGetNetworkConfig,
  useGetPendingTransactions
} from '@/lib';
import { useSendToSelfTransaction } from './hooks';

export const SendToSelf = () => {
  const { address } = useGetAccount();
  const { sendToSelfTransaction } = useSendToSelfTransaction();
  const transactions = useGetPendingTransactions();
  const hasPendingTransactions = transactions.length > 0;
  const { network } = useGetNetworkConfig();

  const [lastTxHash, setLastTxHash] = useState('');

  const onSendToSelfTransaction = async () => {
    try {
      const txHash = await sendToSelfTransaction();
      if (txHash) {
        setLastTxHash(txHash);
      }
    } catch (error) {
      console.error('Failed to send transaction:', error);
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-4'>
        <div className='flex justify-start gap-2'>
          <Button
            onClick={onSendToSelfTransaction}
            data-testid='btnSendToSelf'
            data-cy='transactionBtn'
          >
            <FontAwesomeIcon icon={faPaperPlane} className='mr-2' />
            Send 0 {network.egldLabel} to Self
          </Button>
        </div>
      </div>

      <OutputContainer>
        {!hasPendingTransactions && (
          <>
            <p>
              <Label>Your Address: </Label>
              <span className='font-mono text-sm break-all'>{address}</span>
            </p>
            {lastTxHash && (
              <p>
                <Label>Last Transaction: </Label>
                <span className='font-mono text-sm break-all text-green-600'>
                  {lastTxHash}
                </span>
              </p>
            )}
          </>
        )}

        {hasPendingTransactions && (
          <div className='flex items-center gap-2'>
            <FontAwesomeIcon
              icon={faArrowRight}
              className='animate-pulse text-blue-500'
            />
            <span>Transaction in progress...</span>
          </div>
        )}

        {transactions.length > 0 && (
          <div className='mt-4'>
            <Label>Pending Transactions:</Label>
            <div className='mt-2 space-y-2'>
              {transactions.map((tx, index) => (
                <div
                  key={index}
                  className='text-sm font-mono bg-gray-100 p-2 rounded'
                >
                  <span className='text-gray-600'>Hash: </span>
                  <span className='break-all'>{tx.hash}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </OutputContainer>
    </div>
  );
};
