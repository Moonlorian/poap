import { Link } from 'react-router-dom';
import MultiversXLogo from '@/assets/multiversx-logo.svg';
import { environment } from '@/config';
import { getAccountProvider, useGetIsLoggedIn } from '@/lib';
import { RouteNamesEnum } from '@/routes/routeNames';
import { GitHubButton } from './components/GitHubButton';
import { NotificationsButton } from './components/NotificationsButton';

export const Header = () => {
  const isLoggedIn = useGetIsLoggedIn();

  const handleLogout = async () => {
    const provider = getAccountProvider();
    await provider.logout();
  };

  return (
    <header className='flex flex-row align-center justify-between pl-6 pr-6 pt-6'>
      <Link
        className='flex items-center justify-between'
        to={isLoggedIn ? RouteNamesEnum.dashboard : RouteNamesEnum.home}
      >
        <img src={MultiversXLogo} alt='MultiversX' className='w-full h-6' />
      </Link>

      <nav className='h-full w-full text-sm sm:relative sm:left-auto sm:top-auto sm:flex sm:w-auto sm:flex-row sm:justify-end sm:bg-transparent'>
        <div className='flex justify-end container mx-auto items-center gap-2'>
          <div className='flex gap-1 items-center'>
            <div className='w-2 h-2 rounded-full bg-green-500' />
            <p className='text-gray-600'>{environment}</p>
          </div>

          <GitHubButton />

          {isLoggedIn && (
            <>
              <NotificationsButton />
              <button
                onClick={handleLogout}
                className='inline-block rounded-lg px-3 py-2 text-center hover:no-underline my-0 text-gray-600 hover:bg-slate-100 mx-0'
              >
                Close
              </button>
            </>
          )}

          {!isLoggedIn && (
            <Link
              to={RouteNamesEnum.unlock}
              className='inline-block rounded-lg px-3 py-2 text-center hover:no-underline my-0 bg-blue-600 hover:bg-blue-700 text-white'
            >
              Connect
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};
