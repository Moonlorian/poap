import { AppHeader } from './AppHeader';

export const MobileLayout = ({ children, title, subtitle, showBack, onBack }) => (
  <div className='poap-shell'>
    <div className='poap-frame'>
      <AppHeader title={title} subtitle={subtitle} showBack={showBack} onBack={onBack} />
      <div className='poap-content'>{children}</div>
    </div>
  </div>
);