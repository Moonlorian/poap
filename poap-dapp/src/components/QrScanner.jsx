import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export const QrScanner = ({ onScan, onError }) => {
  const scannerRef = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        scanner.clear().catch(() => undefined);
      },
      (errorMessage) => {
        if (onError) onError(errorMessage);
      }
    );
    setStarted(true);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => undefined);
      }
    };
  }, [onScan, onError]);

  return (
    <div className='poap-qr-scanner'>
      {!started && <p className='poap-muted'>Iniciant càmera...</p>}
      <div id='qr-reader' />
    </div>
  );
};
