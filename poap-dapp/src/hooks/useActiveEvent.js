import { useCallback, useEffect, useState } from 'react';
import { getActiveEvent } from '@/contracts/poapContract';
import { pollUntilChanged } from '@/utils/pollUntilChanged';

export const useActiveEvent = (organizerAddress, pollInterval = 30000) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!organizerAddress) { setEvent(null); setLoading(false); return; }
    try {
      setError(null);
      const activeEvent = await getActiveEvent(organizerAddress);
      setEvent(activeEvent);
    } catch (err) {
      setError(err.message ?? 'Error carregant esdeveniment');
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [organizerAddress]);
  
  const refreshUntilChanged = useCallback(async (currentEvent) => {
    setLoading(true);
    try {
      const currentId = currentEvent?.eventId ?? null;
      const currentStopped = currentEvent?.isStopped ?? null;
      const currentParticipants = currentEvent?.currentParticipants ?? null;

      const newEvent = await pollUntilChanged({
        fetchFn: () => getActiveEvent(organizerAddress),
        previousValue: currentEvent,
        hasChanged: (newVal) => {
          if (newVal?.eventId !== currentId) return true;
          if (newVal?.isStopped !== currentStopped) return true;
          if (newVal?.currentParticipants !== currentParticipants) return true;
          if (newVal === null && currentEvent !== null) return true;
          return false;
        }
      });
      setEvent(newEvent);
    } catch (err) {
      setError(err.message ?? 'Error actualitzant');
    } finally {
      setLoading(false);
    }
  }, [organizerAddress]);

  useEffect(() => {
    refresh();
    if (!organizerAddress || !pollInterval) return undefined;
    const interval = setInterval(refresh, pollInterval);
    return () => clearInterval(interval);
  }, [organizerAddress, pollInterval, refresh]);

  return { event, loading, error, refresh, refreshUntilChanged };
};