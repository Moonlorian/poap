import { Link, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { PoapButton } from '@/components/PoapButton';
import { faucetUrl } from '@/config';
import { RouteNamesEnum } from '@/routes/routeNames';

export const FundsGuidePage = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout title='Guia: Reclamar Fons'>
      <div className='poap-guide'>
        <p className='poap-muted'>
          Serà necessari donar la clau d&apos;aquesta wallet per poder transferir emblemes.
        </p>

        <a className='poap-external-link' href={faucetUrl} target='_blank' rel='noreferrer'>
          Enllaç al faucet de MultiversX
        </a>

        <div className='poap-guide-steps'>
          {[1, 2, 3].map((step) => (
            <div key={step} className='poap-guide-step'>
              <div className='poap-guide-image'>💧</div>
              <p>
                Pas {step}: Obre el faucet Devnet, enganxa la teva adreça erd1... i reclama xEGLD
                per pagar el gas (mínim 0.1).
              </p>
            </div>
          ))}
        </div>

        <div className='poap-guide-actions'>
          <PoapButton variant='secondary' onClick={() => navigate(-1)}>
            Cancel·la
          </PoapButton>
          <Link to={RouteNamesEnum.teacher}>
            <PoapButton className='poap-btn-block'>Fet, torna al formulari</PoapButton>
          </Link>
        </div>
      </div>
    </MobileLayout>
  );
};
