import {
  getAccountProvider,
  UnlockPanelManager,
  useGetAccount,
  useGetIsLoggedIn
} from '@/lib';

const UnlockPanel = () => {
  const isLoggedIn = useGetIsLoggedIn();
  const account = useGetAccount();

  const handleLogout = async () => {
    try {
      const provider = getAccountProvider();
      await provider.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoggedIn) {
    return (
      <div className='unlock-panel'>
        <div className='unlock-panel__content'>
          <h3>Welcome!</h3>
          <p>Address: {account.address}</p>
          <button onClick={handleLogout} className='btn btn-primary'>
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='unlock-panel'>
      <div className='unlock-panel__content'>
        <h3>Connect your wallet</h3>
        <UnlockPanelManager />
      </div>
    </div>
  );
};

export default UnlockPanel;
