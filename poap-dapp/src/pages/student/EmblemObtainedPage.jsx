import { useLocation, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { PoapButton } from '@/components/PoapButton';
import { formatDate, formatDateTime } from '@/utils/dates';
import { RouteNamesEnum } from '@/routes/routeNames';

export const EmblemObtainedPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const event = state?.event;
  const obtainedAt = state?.obtainedAt ?? Date.now();

  if (!event) {
    return (
      <MobileLayout title='Emblema obtingut!' showBack onBack={() => navigate(RouteNamesEnum.student)}>
        <p className='poap-muted'>No s&apos;han trobat dades de l&apos;emblema.</p>
        <PoapButton onClick={() => navigate(RouteNamesEnum.student)}>Retorna</PoapButton>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title='Emblema obtingut!' showBack onBack={() => navigate(RouteNamesEnum.student)}>
      <div className='poap-emblem-obtained'>
        <dl className='poap-details'>
          <div>
            <dt>Classe</dt>
            <dd>{event.name}</dd>
          </div>
          <div>
            <dt>Creació</dt>
            <dd>{formatDate(event.startDate)}</dd>
          </div>
          <div>
            <dt>Obtenció</dt>
            <dd>{formatDate(obtainedAt)}</dd>
          </div>
          <div>
            <dt>Finalització</dt>
            <dd>{formatDateTime(event.endDate)}</dd>
          </div>
        </dl>

        <div className='poap-emblem-image poap-emblem-image--large'>
          {event.emblemUrl ? (
            <img src={event.emblemUrl} alt={event.name} />
          ) : (
            <div className='poap-emblem-placeholder'>🏔</div>
          )}
        </div>

        <PoapButton onClick={() => navigate(RouteNamesEnum.student)}>Retorna</PoapButton>
      </div>
    </MobileLayout>
  );
};
