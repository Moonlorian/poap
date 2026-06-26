import { Link, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { PoapButton } from '@/components/PoapButton';
import { faucetUrl } from '@/config';
import { RouteNamesEnum } from '@/routes/routeNames';

const FAUCET_URL = faucetUrl ?? 'https://devnet-extras.multiversx.com/faucet';

const STEPS = [
  {
    title: '1. Copia la teva adreça de wallet',
    text: (
      <>
        A la pantalla del professor veuràs la teva adreça, que comença per{' '}
        <code>erd1…</code>. Copia-la — la necessitaràs al faucet.
        Si no la veus, torna enrere i inicia sessió amb la teva wallet.
      </>
    ),
    screenshot: 'Panell del professor amb l\'adreça erd1... visible i el botó de copiar'
  },
  {
    title: '2. Obre el faucet de Devnet',
    text: (
      <>
        El faucet és un servei gratuït que envia xEGLD de prova a la teva wallet.
        Clica l&apos;enllaç de baix per obrir-lo en una nova pestanya.
      </>
    ),
    screenshot: 'Pàgina principal del Faucet MultiversX Devnet amb el camp d\'adreça buit'
  },
  {
    title: '3. Enganxa la teva adreça',
    text: (
      <>
        Al camp <strong>&quot;Wallet Address&quot;</strong> del faucet, enganxa
        l&apos;adreça <code>erd1…</code> que has copiat al pas 1.
        Assegura&apos;t que no hi ha espais ni caràcters extres.
      </>
    ),
    screenshot: 'Camp "Wallet Address" del faucet amb una adreça erd1... enganxada'
  },
  {
    title: '4. Clica "Request Tokens"',
    text: (
      <>
        Prem el botó <strong>&quot;Request Tokens&quot;</strong>. El faucet
        t&apos;enviarà <strong>5 xEGLD de prova</strong> a la teva wallet.
        Cada adreça pot demanar fons una vegada cada 24 hores.
      </>
    ),
    screenshot: 'Botó "Request Tokens" del faucet just després d\'introduir l\'adreça'
  },
  {
    title: '5. Espera la confirmació',
    text: (
      <>
        El faucet mostrarà un missatge de confirmació amb l&apos;ID de la
        transacció. La blockchain Devnet sol confirmar en{' '}
        <strong>6 segons</strong> aproximadament. Pots clicar l&apos;ID per
        veure la transacció a l&apos;Explorer.
      </>
    ),
    screenshot: 'Missatge de confirmació del faucet amb l\'ID de transacció i un enllaç a l\'Explorer'
  },
  {
    title: '6. Torna i crea la classe',
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
                <div className='poap-screenshot'>
                  <span className='poap-screenshot-icon' aria-hidden='true'>
                    🖼
                  </span>
                  <p className='poap-screenshot-label'>{step.screenshot}</p>
                </div>
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