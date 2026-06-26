import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { PoapButton } from '@/components/PoapButton';
import { QrDisplay } from '@/components/QrDisplay';
import { useActiveEvent } from '@/hooks/useActiveEvent';
import { useOrganizerPem } from '@/hooks/useOrganizerPem';
import { useGetAccount } from '@/lib';
import { RouteNamesEnum } from '@/routes/routeNames';
import { buildClaimUrl } from '@/utils/dates';

export const QrPage = () => {
  const navigate = useNavigate();
  const { address } = useGetAccount();
  const { event, loading } = useActiveEvent(address, null);
  const { pem } = useOrganizerPem();

  const claimUrl =
    address && pem ? buildClaimUrl(window.location.origin, address, pem) : null;

  return (
    <MobileLayout
      title='QR de la classe'
      showBack
      onBack={() => navigate(RouteNamesEnum.teacher)}
    >
      <div className='poap-qr-page'>
        {loading && <p className='poap-muted'>Carregant...</p>}

        {!loading && !event && (
          <p className='poap-error'>No hi ha cap classe activa.</p>
        )}

        {!loading && event && (
          <>
            <p className='poap-event-name'>{event.name}</p>

            {!pem ? (
              <p className='poap-error'>
                No s&apos;ha trobat la clau PEM. Crea la classe de nou.
              </p>
            ) : (
              <QrDisplay value={claimUrl} title={event.name} />
            )}
          </>
        )}

        <PoapButton variant='secondary' onClick={() => navigate(RouteNamesEnum.teacher)}>
          Tornar al panell
        </PoapButton>
      </div>
    </MobileLayout>
  );
};