import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { PoapButton } from './PoapButton';

export const QrDisplay = ({ value, title }) => {
  const canvasRef = useRef(null);

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'classe-qr.png';
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className='poap-qr-display'>
      {title && <p className='poap-section-title'>{title}</p>}
      <div className='poap-qr-canvas' ref={canvasRef}>
        <QRCodeCanvas value={value} size={260} level='L' includeMargin />
      </div>
      <PoapButton variant='secondary' onClick={handleDownload}>
        Descarrega PNG
      </PoapButton>
    </div>
  );
};
