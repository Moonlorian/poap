export const OutputContainer = ({ children, isLoading = false }) => {
  return (
    <div className='border border-gray-200 rounded-lg p-4 bg-gray-50'>
      {isLoading ? (
        <div className='flex items-center justify-center py-4'>
          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
        </div>
      ) : (
        children
      )}
    </div>
  );
};
