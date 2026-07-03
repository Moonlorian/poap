import { Link } from 'react-router-dom';

export const PageNotFound = () => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-6xl font-bold text-white mb-4'>404</h1>
        <h2 className='text-2xl font-semibold text-gray-300 mb-4'>
          Page Not Found
        </h2>
        <p className='text-gray-400 mb-8'>
          The page you're looking for doesn't exist.
        </p>
        <Link
          to='/'
          className='inline-block bg-mvx-blue hover:bg-mvx-blue/80 text-white font-semibold py-3 px-6 rounded-lg transition-colors'
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};
