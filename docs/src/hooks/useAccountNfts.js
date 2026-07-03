import { useCallback, useEffect, useState } from 'react';
import { fetchAccountNfts } from '@/api/devnetApi';

export const useAccountNfts = (address) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!address) {
      setNfts([]);
      setLoading(false);
      return;
    }

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

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { nfts, loading, error, refresh };
};
