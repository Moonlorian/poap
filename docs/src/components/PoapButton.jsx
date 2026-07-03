export const PoapButton = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => (
  <button
    type='button'
    className={`poap-btn poap-btn--${variant} ${className}`.trim()}
    {...props}
  >
    {children}
  </button>
);
