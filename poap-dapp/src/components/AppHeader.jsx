import { companyName } from '@/config';

export const AppHeader = ({ title, showBack, onBack }) => (
  <header className='poap-header'>
    {showBack ? (
      <button type='button' className='poap-back' onClick={onBack} aria-label='Tornar'>
        ←
      </button>
    ) : (
      <div className='poap-header-icon'>☁</div>
    )}
    <div className='poap-header-text'>
      {title ? <h1>{title}</h1> : <span className='poap-company'>{companyName}</span>}
    </div>
  </header>
);
