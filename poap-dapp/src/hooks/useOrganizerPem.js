import { useCallback, useEffect, useState } from 'react';
import { validatePem, getAddressFromPem, getAddressFromKeystore } from '@/contracts/poapContract';
import { ORGANIZER_PEM_KEY } from '@/config';

export const useOrganizerPem = () => {
  const [pem, setPem] = useState(() => sessionStorage.getItem(ORGANIZER_PEM_KEY));
  const [pemAddress, setPemAddress] = useState(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!pem) {
      setPemAddress(null);
      setIsValid(false);
      return;
    }
    try {
      const addr = getAddressFromPem(pem);
      setPemAddress(addr);
      setIsValid(true);
    } catch {
      setPemAddress(null);
      setIsValid(false);
    }
  }, [pem]);

  const savePem = useCallback((rawPem) => {
    const trimmed = rawPem?.trim() ?? '';
    if (!validatePem(trimmed)) return false;
    sessionStorage.setItem(ORGANIZER_PEM_KEY, trimmed);
    setPem(trimmed);
    return true;
  }, []);

  const saveFromKeystore = useCallback(async (keystoreJson, password) => {
    const { decryptKeystoreToPem } = await import('@/contracts/poapContract');
    const pemResult = decryptKeystoreToPem(keystoreJson, password);
    sessionStorage.setItem(ORGANIZER_PEM_KEY, pemResult);
    setPem(pemResult);
    return getAddressFromKeystore(keystoreJson, password);
  }, []);

  const clearPem = useCallback(() => {
    sessionStorage.removeItem(ORGANIZER_PEM_KEY);
    setPem(null);
  }, []);

  return { pem, pemAddress, savePem, saveFromKeystore, clearPem, isValid };
};