import { useCallback, useEffect, useState } from 'react';
import { getActiveEvent } from '@/contracts/poapContract';

export const useActiveEvent = (organizerAddress, pollInterval = 30000) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!organizerAddress) {
      setEvent(null);
      setLoading(false);
      return;
    }

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

  useEffect(() => {
    refresh();
    if (!organizerAddress || !pollInterval) return undefined;

    const interval = setInterval(refresh, pollInterval);
    return () => clearInterval(interval);
  }, [organizerAddress, pollInterval, refresh]);

  return { event, loading, error, refresh };
};
