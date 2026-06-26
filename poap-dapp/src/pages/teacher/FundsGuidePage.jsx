import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { PoapButton } from '@/components/PoapButton';
import { faucetUrl, minEgld } from '@/config';
import { RouteNamesEnum } from '@/routes/routeNames';

export const FundsGuidePage = () => {
  const navigate = useNavigate();

  const steps = [
    `La teva wallet necessita com a mínim ${minEgld} xEGLD per pagar el gas de les transaccions.`,
    'Accedeix al faucet de Devnet amb el botó de sota.',
    'Inicia sessió amb el teu wallet.',
    'Sol·licita xEGLD gratuïts (tokens de prova, sense valor real).',
    'Espera uns segons i torna a intentar crear la classe.'
  ];

  return (
    <MobileLayout
      title='Obtenir fons'
      showBack
      onBack={() => navigate(RouteNamesEnum.teacher)}
    >
      <div className='poap-guide'>
        <p className='poap-subtitle'>
          No tens prou xEGLD per crear la classe.
        </p>

        <ol className='poap-guide-steps'>
          {steps.map((step, i) => (
            <li key={i} className='poap-guide-step'>
              <span className='poap-step-num'>{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <PoapButton onClick={() => window.open(faucetUrl, '_blank')}>
          Anar al Faucet de Devnet
        </PoapButton>

        <PoapButton variant='secondary' onClick={() => navigate(RouteNamesEnum.teacher)}>
          Tornar al panell professor
        </PoapButton>
      </div>
    </MobileLayout>
  );
};
