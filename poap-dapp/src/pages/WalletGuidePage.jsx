import { Link } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { PoapButton } from '@/components/PoapButton';
import { walletGuideUrl } from '@/config';
import { RouteNamesEnum } from '@/routes/routeNames';

export const WalletGuidePage = () => (
  <MobileLayout title='Guia: Crear nou Wallet'>
    <div className='poap-guide'>
      <p className='poap-subtitle'>
        Ja tens un wallet?{' '}
        <Link className='poap-link' to={RouteNamesEnum.home}>
          Log In
        </Link>
      </p>

      <a className='poap-external-link' href={walletGuideUrl} target='_blank' rel='noreferrer'>
        Enllaç a MultiversX
      </a>

      <div className='poap-guide-steps'>
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className='poap-guide-step'>
            <div className='poap-guide-image'>🏔</div>
            <p>
              Pas {step}: Descarrega la DeFi Wallet o crea un compte al Web Wallet de MultiversX
              Devnet.
            </p>
          </div>
        ))}
      </div>

      <Link to={RouteNamesEnum.home}>
        <PoapButton className='poap-btn-block'>Fet, torna al Login</PoapButton>
      </Link>
    </div>
  </MobileLayout>
);
