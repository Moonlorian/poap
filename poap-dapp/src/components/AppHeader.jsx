import { companyName } from '@/config';

export const AppHeader = ({ title, subtitle, showBack, onBack }) => (
  <header className='poap-header'>
    {showBack ? (
      <button type='button' className='poap-back' onClick={onBack} aria-label='Tornar'>
        ←
      </button>
    ) : (
      <img className='poap-header-icon' src="/poap/favicon.ico" alt='' />
    )}
    <div className='poap-header-text'>
      {title ? <h1>{title}</h1> : <span className='poap-company'>{companyName}</span>}
      {subtitle && <p className='poap-header-subtitle'>{subtitle}</p>}
    </div>
  </header>
);