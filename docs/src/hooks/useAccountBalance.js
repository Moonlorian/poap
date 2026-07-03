import { useCallback, useEffect, useState } from 'react';
import { fetchAccountBalance } from '@/api/devnetApi';
import { minEgld } from '@/config';

export const useAccountBalance = (address, pollInterval = 30000) => {
  const [balance, setBalance]     = useState(null); // xEGLD (número)
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const refresh = useCallback(async () => {
    if (!address) {
      setBalance(null);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const bal = await fetchAccountBalance(address);
      setBalance(bal);
    } catch (err) {
      setError(err?.message ?? 'Error en obtenir el saldo');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    setLoading(true);
    refresh();
    if (!address || !pollInterval) return undefined;
    const interval = setInterval(refresh, pollInterval);
    return () => clearInterval(interval);
  }, [address, pollInterval, refresh]);

  const hasEnoughFunds = balance !== null && balance >= minEgld;

  return { balance, loading, error, hasEnoughFunds, refresh };
};
