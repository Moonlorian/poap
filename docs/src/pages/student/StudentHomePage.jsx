import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmblemGrid } from '@/components/EmblemGrid';
import { MobileLayout } from '@/components/MobileLayout';
import { PoapButton } from '@/components/PoapButton';
import { QrScanner } from '@/components/QrScanner';
import { fetchNftCount } from '@/api/devnetApi';
import { useAccountNfts } from '@/hooks/useAccountNfts';
import { getAccountProvider, useGetAccount } from '@/lib';
import { RouteNamesEnum } from '@/routes/routeNames';

export const StudentHomePage = () => {
  const navigate = useNavigate();
  const { address } = useGetAccount();
  const { nfts, loading, refresh } = useAccountNfts(address);
  const [showScanner, setShowScanner] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [error, setError] = useState('');
  const [nftCount, setNftCount] = useState(null);

  const handleLogout = async () => {
    const provider = getAccountProvider();
    await provider.logout();
    navigate(RouteNamesEnum.home);
  };

  const openClaimUrl = (urlText) => {
    try {
      const url = new URL(urlText, window.location.origin);
      const organizer = url.searchParams.get('o');
      const key = url.searchParams.get('k');

      if (!organizer || !key) {
        setError('URL no vàlida. Ha de contenir els paràmetres o i k.');
        return;
      }

      setError('');
      navigate(`${RouteNamesEnum.claim}?o=${organizer}&k=${key}`);
    } catch {
      setError('URL no vàlida.');
    }
  };

  const handleScan = (decodedText) => {
    setShowScanner(false);
    openClaimUrl(decodedText);
  };

  const handleManualSubmit = (event) => {
    event.preventDefault();
    openClaimUrl(manualUrl.trim());
  };

  const loadCount = async () => {
    const count = await fetchNftCount(address);
    setNftCount(count);
    refresh();
  };

  return (
    <MobileLayout title='Alumne' showBack onBack={() => navigate(RouteNamesEnum.role)}>
      <div className='poap-student'>
        <section className='poap-section'>
          <h3>Participa en classes</h3>
          {!showScanner ? (
            <PoapButton onClick={() => setShowScanner(true)}>Escaneja QR</PoapButton>
          ) : (
            <>
              <QrScanner onScan={handleScan} />
              <PoapButton variant='secondary' onClick={() => setShowScanner(false)}>
                Cancel·la escaneig
              </PoapButton>
            </>
          )}

          <p className='poap-muted poap-mt'>O bé, introdueix l&apos;URL manualment</p>
          <form className='poap-form' onSubmit={handleManualSubmit}>
            <input
              type='url'
              placeholder='URL de la classe'
              value={manualUrl}
              onChange={(event) => setManualUrl(event.target.value)}
            />
            <PoapButton type='submit'>Entra</PoapButton>
          </form>
          {error && <p className='poap-error'>{error}</p>}
        </section>

        <section className='poap-section'>
          <div className='poap-section-header'>
            <h3>Emblemes - {nftCount ?? nfts.length}</h3>
            <button type='button' className='poap-text-btn' onClick={loadCount}>
              Actualitza
            </button>
          </div>
          <EmblemGrid nfts={nfts} loading={loading} />
        </section>
      </div>
    </MobileLayout>
  );
};
