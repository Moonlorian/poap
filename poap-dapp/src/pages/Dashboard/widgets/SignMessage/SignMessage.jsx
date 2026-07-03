import { useState } from 'react';
import { Button, OutputContainer } from '@/components';
import { Address, getAccountProvider, Message, useGetAccount } from '@/lib';
import { SignFailure, SignSuccess } from './components';

export const SignMessage = () => {
  const [message, setMessage] = useState('');
  const [signedMessage, setSignedMessage] = useState(null);
  const [state, setState] = useState('pending');

  const [signature, setSignature] = useState('');
  const { address } = useGetAccount();
  const provider = getAccountProvider();

  const handleSubmit = async () => {
    try {
      const messageToSign = new Message({
        address: new Address(address),
        data: new TextEncoder().encode(message)
      });

      const signedMessageResult = await provider.signMessage(messageToSign);

      if (!signedMessageResult?.signature) {
        setState('error');
        return;
      }

      setState('success');
      setSignature(
        Array.from(signedMessageResult?.signature, (byte) =>
          byte.toString(16).padStart(2, '0')
        ).join('')
      );
      setSignedMessage(signedMessageResult);
      setMessage('');
    } catch (error) {
      console.error(error);
      setState('error');
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSignature('');
    setState('pending');
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex gap-2 items-start'>
        {['success', 'error'].includes(state) ? (
          <Button
            data-testid='closeTransactionSuccessBtn'
            id='closeButton'
            onClick={handleClear}
          >
            {state === 'error' ? 'Try again' : 'Clear'}
          </Button>
        ) : (
          <Button data-testid='signMsgBtn' onClick={handleSubmit}>
            Sign
          </Button>
        )}
      </div>
      <OutputContainer>
        {!['success', 'error'].includes(state) && (
          <textarea
            placeholder='Write message here'
            className='resize-none w-full h-32 rounded-lg focus:outline-none focus:border-blue-500 p-2'
            onChange={(event) => {
              setMessage(event.currentTarget.value);
            }}
            onKeyUp={(event) => {
              setMessage(event.currentTarget.value);
            }}
          />
        )}

        {state === 'success' && signedMessage != null && (
          <SignSuccess
            message={signedMessage}
            signature={signature}
            address={address}
          />
        )}

        {state === 'error' && <SignFailure />}
      </OutputContainer>
    </div>
  );
};
