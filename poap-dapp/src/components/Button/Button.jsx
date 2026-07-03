export const Button = ({
  children,
  onClick,
  disabled = false,
  type = 'button',
  id,
  className = 'inline-block rounded-lg px-3 py-2 text-center hover:no-underline my-0 bg-blue-600 text-white hover:bg-blue-700 mr-0 disabled:bg-gray-200 disabled:text-black disabled:cursor-not-allowed',
  dataTestId,
  dataCy,
  ...otherProps
}) => {
  return (
    <button
      id={id}
      data-testid={dataTestId}
      data-cy={dataCy}
      disabled={disabled}
      onClick={onClick}
      className={className}
      type={type}
      {...otherProps}
    >
      {children}
    </button>
  );
};
