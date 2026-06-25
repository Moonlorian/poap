import { useCallback, useEffect, useState } from 'react';
import { validatePem, getAddressFromPem } from '@/contracts/poapContract';

const SESSION_KEY = 'poap:organizerPem';

/**
 * Persists the organizer PEM in sessionStorage for the duration of the session.
 *
 * Usage in teacher flow:
 *   const { pem, pemAddress, savePem, clearPem, isValid } = useOrganizerPem();
 *
 * - savePem(rawPem)  — validates and stores; returns true on success
 * - clearPem()       — removes from state + sessionStorage
 * - pem              — current PEM string or null
 * - pemAddress       — bech32 address derived from PEM, or null
 * - isValid          — whether the stored PEM passes validation
 */
export const useOrganizerPem = () => {
  const [pem, setPem] = useState(() => sessionStorage.getItem(SESSION_KEY));
  const [pemAddress, setPemAddress] = useState(null);
  const [isValid, setIsValid] = useState(false);

  // Derive address whenever pem changes
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

    sessionStorage.setItem(SESSION_KEY, trimmed);
    setPem(trimmed);
    return true;
  }, []);

  const clearPem = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setPem(null);
  }, []);

  return { pem, pemAddress, savePem, clearPem, isValid };
};
