import { useCallback, useEffect, useState } from 'react';
import { fetchAccountNfts } from '@/api/devnetApi';
import { pollUntilChanged } from '@/utils/pollUntilChanged';

export const useAccountNfts = (address) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!address) { setNfts([]); setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAccountNfts(address);
      setNfts(data);
    } catch (err) {
      setError(err.message ?? 'Error carregant emblemes');
      setNfts([]);
    } finally {
      setLoading(false);
    }
  }, [address]);

  const refreshUntilChanged = useCallback(async (currentNfts) => {
    setLoading(true);
    try {
      const currentCount = currentNfts?.length ?? 0;
      const newNfts = await pollUntilChanged({
        fetchFn: () => fetchAccountNfts(address),
        previousValue: currentNfts,
        hasChanged: (newVal) => (newVal?.length ?? 0) !== currentCount
      });
      setNfts(newNfts ?? []);
    } catch (err) {
      setError(err.message ?? 'Error actualitzant');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => { refresh(); }, [refresh]);

  return { nfts, loading, error, refresh, refreshUntilChanged };
};