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

  const handleCopyTitle = async () => {
    if (!title) return;

    try {
      await navigator.clipboard.writeText(title);
    } catch (err) {
      console.error('No se pudo copiar el título:', err);
    }
  };

  return (
    <div className="poap-qr-display">
      {title && (
        <div className="poap-section-header">
          <p className="poap-section-title">{title}</p>
          <button
            className="poap-copy-button"
            onClick={handleCopyTitle}
            title="Copiar título"
          >
            📋
          </button>
        </div>
      )}

      <div className="poap-qr-canvas" ref={canvasRef}>
        <QRCodeCanvas value={value} size={260} level="L" includeMargin />
      </div>

      <PoapButton variant="secondary" onClick={handleDownload}>
        Descarrega PNG
      </PoapButton>
    </div>
  );
};