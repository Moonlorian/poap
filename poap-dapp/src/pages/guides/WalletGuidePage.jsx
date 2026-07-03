import { Link } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { PoapButton } from '@/components/PoapButton';
import { walletGuideUrl } from '@/config';
import { RouteNamesEnum } from '@/routes/routeNames';

const STEPS = [
  {
    title: '1. Obre la Web Wallet de Devnet',
    text: (
      <>
        Vés a{' '}
        <a
          className='poap-link'
          href={walletGuideUrl}
          target='_blank'
          rel='noreferrer'
        >
          devnet-wallet.multiversx.com
        </a>{' '}
        i clica el botó <strong>&quot;Create a new wallet&quot;</strong>.
      </>
    ),
    screenshot: '/guide_create/guide1.png'
  },
  {
    title: '2. Llegeix l’avís de seguretat',
    text: 'La wallet mostrarà un avís important sobre com guardar les teves credencials. Llegeix-lo i clica "Continue".',
    screenshot: '/guide_create/guide2.png'
  },
  {
    title: '3. Guarda la teva frase secreta',
    text: (
      <>
        Apareixeran <strong>24 paraules numerades</strong>: és la teva Frase
        Secreta (Secret Phrase). Només es mostra aquesta vegada, copia-la o
        escriu-la en un lloc segur abans de continuar.
      </>
    ),
    screenshot: '/guide_create/guide3.png'
  },
  {
    title: '4. Confirma la frase',
    text: 'Et demanarà introduir algunes de les paraules, en l\u2019ordre indicat, per comprovar que les has desat correctament.',
    screenshot: '/guide_create/guide4.png'
  },
  {
    title: '5. Estableix una contrasenya',
    text: 'Tria una contrasenya per protegir el fitxer de la teva wallet (keystore) en aquest dispositiu.',
    screenshot: '/guide_create/guide5.png'
  },
  {
    title: '6. Descarrega el fitxer keystore',
    text: (
      <>
        Es descarregarà un fitxer <code>.json</code> (keystore). Juntament amb
        la contrasenya del pas anterior, és la teva clau d'accés.
        Guarda'l bé, no el comparteixis amb ningú.
      </>
    ),
    screenshot: '/guide_create/guide6.png'
  },
  {
    title: '7. Torna a l’aplicació i inicia sessió',
    text: 'Ja tens la teva wallet. Torna al Login i entra-hi seleccionant "Web Wallet" amb el fitxer keystore i la contrasenya que has creat.',
    screenshot: null
  }
];

export const WalletGuidePage = () => (
  <MobileLayout title='Guia: Crear nou Wallet'>
    <div className='poap-guide'>
      <p className='poap-subtitle'>
        Ja tens un wallet?{' '}
        <Link className='poap-link' to={RouteNamesEnum.home}>
          Log In
        </Link>
      </p>

      <p className='poap-muted'>
        Aquesta guia crea una <strong>Web Wallet a la xarxa de proves (Devnet)</strong> de
        MultiversX. No fa falta instal·lar res: tot es fa des del navegador.
        La DeFi Wallet (extensió de navegador) és una alternativa vàlida,
        però no es cobreix en aquesta guia.
      </p>

      <a
        className='poap-external-link'
        href={walletGuideUrl}
        target='_blank'
        rel='noreferrer'
      >
        Obrir devnet-wallet.multiversx.com ↗
      </a>

      <ol className='poap-guide-steps'>
        {STEPS.map((step) => (
          <li key={step.title} className='poap-guide-step poap-guide-step--detailed'>
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

      <Link to={RouteNamesEnum.home}>
        <PoapButton className='poap-btn-block'>Fet, torna al Login</PoapButton>
      </Link>
    </div>
  </MobileLayout>
);