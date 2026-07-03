import { Link, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { PoapButton } from '@/components/PoapButton';
import { faucetUrl } from '@/config';
import { RouteNamesEnum } from '@/routes/routeNames';

const FAUCET_URL = faucetUrl ?? 'https://devnet-extras.multiversx.com/faucet';

const STEPS = [
  {
    title: '1. Obre el faucet de Devnet',
    text: (
      <>
        El faucet és un servei gratuït que envia xEGLD de prova a la teva wallet.
        Clica l&apos;enllaç a&apos;inici de la guia per obrir-lo en una nova pestanya.
      </>
    ),
    screenshot: null
  },
  {
    title: '2. Activa el faucet',
    text: (
      <>
        Al iniciar sessio correctament, veuras un menu sota a l&apos;esquerra, 
        anomenat <strong>Faucet</strong>
      </>
    ),
    screenshot: '/guide_claim/guide1.png'
  },
  {
    title: '3. Clica "Request Tokens"',
    text: (
      <>
        Prem el botó <strong>&quot;Request Tokens&quot;</strong>. El faucet
        t&apos;enviarà <strong>5 xEGLD</strong> a la teva wallet.
        Cada adreça pot demanar fons una vegada cada 24 hores.
      </>
    ),
    screenshot: '/guide_claim/guide2.png'
  },
  {
    title: '4. Espera la confirmació',
    text: (
      <>
        El faucet mostrarà un missatge de confirmació. La multiversx sol confirmar en{' '}
        <strong>6 segons</strong> aproximadament. Pots clicar l&apos;ID per
        veure la transacció a l&apos;Explorer.
      </>
    ),
    screenshot: null
  },
  {
    title: '5. Torna i crea la classe',
    text: (
      <>
        Un cop confirmada la transacció, torna a aquesta aplicació i clica{' '}
        <strong>&quot;Tornar al formulari&quot;</strong>. El sistema comprovarà
        automàticament el saldo i et permetrà crear la classe.
      </>
    ),
    screenshot: null
  }
];

export const FundsGuidePage = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout title='Guia: Reclamar xEGLD'>
      <div className='poap-guide'>
        <p className='poap-muted'>
          Per crear una classe, la teva wallet necessita un mínim de{' '}
          <strong>xEGLD</strong> per pagar el gas de les transaccions a la
          blockchain. Aquesta guia explica com obtenir-ne de forma gratuïta
          des del <em>faucet</em> de la xarxa Devnet de MultiversX.
        </p>

        <a
          className='poap-external-link'
          href={FAUCET_URL}
          target='_blank'
          rel='noreferrer'
        >
          Obrir el Faucet MultiversX Devnet ↗
        </a>

        <ol className='poap-guide-steps'>
          {STEPS.map((step) => (
            <li
              key={step.title}
              className='poap-guide-step poap-guide-step--detailed'
            >
              <div className='poap-guide-step-header'>
                <h4>{step.title}</h4>
              </div>
              <p className='poap-guide-step-text'>{step.text}</p>
              {step.screenshot && (
                <img className='poap-screenshot' src={step.screenshot} />
              )}
            </li>
          ))}
        </ol>

        <Link to={RouteNamesEnum.teacher}>
          <PoapButton className='poap-btn-block'>
            Tornar al formulari
          </PoapButton>
        </Link>
      </div>
    </MobileLayout>
  );
};