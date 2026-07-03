import { AppHeader } from './AppHeader';

export const MobileLayout = ({ children, title, showBack, onBack }) => (
  <div className='poap-shell'>
    <div className='poap-frame'>
      <AppHeader title={title} showBack={showBack} onBack={onBack} />
      <div className='poap-content'>{children}</div>
    </div>
  </div>
);
