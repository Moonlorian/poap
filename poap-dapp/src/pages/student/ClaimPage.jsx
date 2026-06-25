import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { PoapButton } from '@/components/PoapButton';
import {
  claimEmblemWithPem,
  getActiveEvent,
  validatePem
} from '@/contracts/poapContract';
import { useGetAccount } from '@/lib';
import { parseClaimParams } from '@/utils/dates';
import { RouteNamesEnum } from '@/routes/routeNames';

export const ClaimPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { address } = useGetAccount();
  const { organizer, pem } = parseClaimParams(searchParams);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!organizer || !pem) {
      setError('Enllaç de classe incomplet.');
      setStatus('error');
    }
  }, [organizer, pem]);

  const handleClaim = async () => {
    if (!validatePem(pem)) {
      setError('Clau PEM no vàlida.');
      setStatus('error');
      return;
    }

    try {
      setStatus('loading');
      setError('');

      const activeEvent = await getActiveEvent(organizer);
      if (!activeEvent) {
        throw new Error('No hi ha cap classe activa per aquest professor.');
      }

      await claimEmblemWithPem({ pem, recipientAddress: address });

      navigate(RouteNamesEnum.emblemObtained, {
        state: {
          event: activeEvent,
          obtainedAt: Date.now()
        }
      });
    } catch (err) {
      setError(err.message ?? 'Error en reclamar l\'emblema.');
      setStatus('error');
    }
  };

  return (
    <MobileLayout title='Unir-se a l&apos;esdeveniment' showBack onBack={() => navigate(RouteNamesEnum.student)}>
      <div className='poap-claim'>
        <p className='poap-muted'>Professor: {organizer || '-'}</p>
        <p className='poap-muted'>Alumne: {address}</p>

        {status === 'loading' && <p>Processant reclamació...</p>}
        {error && <p className='poap-error'>{error}</p>}

        {status !== 'loading' && (
          <PoapButton onClick={handleClaim} disabled={!organizer || !pem}>
            Reclamar emblema
          </PoapButton>
        )}
      </div>
    </MobileLayout>
  );
};
