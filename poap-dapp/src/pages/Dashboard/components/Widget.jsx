export const Widget = ({ title, description, reference, children }) => {
  return (
    <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
      <div className='flex items-center mb-4'>
        <h2 className='text-xl font-medium text-gray-900'>{title}</h2>
        {reference && (
          <a
            href={reference}
            target='_blank'
            rel='noopener noreferrer'
            className='ml-2 text-blue-600 hover:text-blue-800 text-sm'
          >
            ℹ️
          </a>
        )}
      </div>
      {description && (
        <p className='text-gray-500 mb-6 text-sm'>{description}</p>
      )}
      {children}
    </div>
  );
};
