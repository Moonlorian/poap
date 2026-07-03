import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { PoapButton } from '@/components/PoapButton';
import { claimEmblemWithPem, getActiveEvent } from '@/contracts/poapContract';
import { buildNftIdentifier, recordEmblemDate } from '@/utils/emblemDates';
import { useGetAccount } from '@/lib';
import { RouteNamesEnum } from '@/routes/routeNames';
import { parseClaimParams } from '@/utils/dates';
import { tokenId } from '@/config';

const STATUS = { IDLE: 'idle', CLAIMING: 'claiming', SUCCESS: 'success', ERROR: 'error' };

export const ClaimPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { address } = useGetAccount();

  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMsg, setErrorMsg] = useState('');
  const [event, setEvent] = useState(null);
  const claimed = useRef(false);

  const { organizer, pem } = parseClaimParams(searchParams);

  useEffect(() => {
    if (!organizer || !pem || !address || claimed.current) return;

    const run = async () => {
      claimed.current = true;
      setStatus(STATUS.CLAIMING);
      setErrorMsg('');

      if (!pem) {
        setStatus(STATUS.ERROR);
        setErrorMsg('El QR no és vàlid. Torna a escanejar-lo.');
        return;
      }

      try {
        const activeEvent = await getActiveEvent(organizer);
        setEvent(activeEvent);

        await claimEmblemWithPem({ pem, recipientAddress: address });
        if (activeEvent?.tokenNonce != null) {
          const identifier = buildNftIdentifier(tokenId, activeEvent.tokenNonce);
          recordEmblemDate(identifier, Date.now());
        }

        setStatus(STATUS.SUCCESS);
      } catch (err) {
        claimed.current = false;
        setStatus(STATUS.ERROR);
        setErrorMsg(err?.message ?? "Error en reclamar l'emblema.");
      }
    };

    run();
  }, [organizer, pem, address]);

  const handleContinue = () => {
    navigate(RouteNamesEnum.emblemObtained, { state: { event } });
  };

  return (
    <MobileLayout title='Unir-se a la classe'>
      <div className='poap-claim'>
        {(status === STATUS.IDLE || status === STATUS.CLAIMING) && (
          <div className='poap-claim-loading'>
            <div className='poap-spinner' />
            <p className='poap-muted'>Reclamant el teu emblema...</p>
            {event && <p className='poap-event-name'>{event.name}</p>}
          </div>
        )}

        {status === STATUS.SUCCESS && (
          <div className='poap-claim-success'>
            <p className='poap-success-icon'>✅</p>
            <h3>Emblema rebut!</h3>
            {event && <p className='poap-event-name'>{event.name}</p>}
            <PoapButton onClick={handleContinue}>Veure l&apos;emblema</PoapButton>
          </div>
        )}

        {status === STATUS.ERROR && (
          <div className='poap-claim-error'>
            <p className='poap-error-icon'>❌</p>
            <h3>Error en reclamar</h3>
            <p className='poap-error'>{errorMsg}</p>
            <PoapButton variant='secondary' onClick={() => navigate(RouteNamesEnum.student)}>
              Tornar al panell
            </PoapButton>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};