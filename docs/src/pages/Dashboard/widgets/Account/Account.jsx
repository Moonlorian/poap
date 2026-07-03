import { Label, OutputContainer } from '@/components';
import { FormatAmount, useGetAccount } from '@/lib';

export const Account = () => {
  const account = useGetAccount();

  // Helper function to get username without domain
  const getUsername = (username) => {
    if (!username) return 'N/A';
    return username.replace('.elrond', '');
  };

  return (
    <OutputContainer>
      <div className='flex flex-col space-y-3 text-sm'>
        <div>
          <Label>Address: </Label>
          <span
            className='font-mono text-gray-900 break-all ml-2'
            data-testid='accountAddress'
          >
            {account.address}
          </span>
        </div>

        <div>
          <Label>Herotag: </Label>
          <span className='text-gray-900 ml-2' data-testid='heroTag'>
            {getUsername(account.username)}
          </span>
        </div>

        <div>
          <Label>Shard: </Label>
          <span className='text-gray-900 ml-2'>{account.shard || 'N/A'}</span>
        </div>

        <div>
          <Label>Balance: </Label>
          <FormatAmount value={account.balance} data-testid='balance' />
        </div>
      </div>
    </OutputContainer>
  );
};
