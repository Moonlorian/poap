import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { PartnerLogos } from '@/components/PartnerLogos';
import { PoapButton } from '@/components/PoapButton';
import { useWalletLogin } from '@/hooks/useWalletLogin';
import { useGetIsLoggedIn } from '@/lib';
import { RouteNamesEnum } from '@/routes/routeNames';
import { ROLE_KEY } from '@/config';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isLoggedIn = useGetIsLoggedIn();
  const { loginWebWallet, loginDeFiWallet } = useWalletLogin();

  useEffect(() => {
  if (!isLoggedIn) return;

  const hasClaim = searchParams.get('o') && searchParams.get('k');
  if (hasClaim) {
    sessionStorage.setItem(ROLE_KEY, 'student');
    navigate(`${RouteNamesEnum.claim}?${searchParams.toString()}`, { replace: true });
    return;
  }

  const redirect = searchParams.get('redirect');
  if (redirect) {
    navigate(decodeURIComponent(redirect), { replace: true });
    return;
  }

  navigate(RouteNamesEnum.role, { replace: true });
  }, [isLoggedIn, navigate, searchParams]);

  return (
    <MobileLayout subtitle="Emblemes digitals per a cada sessió">
      <div className='poap-login'>
        <h2 className='poap-title'>Benvingut/da</h2>
        <p className='poap-subtitle'>Inicia sessió amb el teu wallet per continuar</p>

        <div className='poap-login-actions'>
          <PoapButton onClick={loginWebWallet}>Web Wallet</PoapButton>
        </div>

        <Link className='poap-link' to={RouteNamesEnum.walletGuide}>
          Crea un Wallet nou
        </Link>

        <PartnerLogos />
      </div>
    </MobileLayout>
  );
};