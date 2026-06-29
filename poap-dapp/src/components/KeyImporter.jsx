import { useRef, useState } from 'react';
import { PoapButton } from '@/components/PoapButton';

/**
 * KeyImporter — allows the teacher to provide their signing key via:
 *   - PEM file / paste
 *   - JSON keystore file + password (MultiversX Web Wallet format)
 *
 * Props:
 *   onPemReady(pem: string) — called with the final PEM when import succeeds
 *   currentAddress: string | null — address derived from current key (for display)
 */
export const KeyImporter = ({ onPemReady, currentAddress }) => {
  const [tab, setTab] = useState('keystore'); // 'keystore' | 'pem'
  const [pemText, setPemText] = useState('');
  const [keystoreJson, setKeystoreJson] = useState(null);
  const [keystoreFilename, setKeystoreFilename] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  // ── Keystore tab ──────────────────────────────────────────────────────────

  const handleFileChange = (e) => {
    setError('');
    setKeystoreJson(null);
    setKeystoreFilename('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        if (!json.crypto && !json.Crypto) {
          setError('El fitxer no és un wallet JSON vàlid de MultiversX.');
          return;
        }
        setKeystoreJson(json);
        setKeystoreFilename(file.name);
      } catch {
        setError('No s\'ha pogut llegir el fitxer JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleKeystoreSubmit = async () => {
    setError('');
    if (!keystoreJson) return setError('Selecciona un fitxer de wallet.');
    if (!password) return setError('Introdueix la contrasenya.');

    setLoading(true);
    try {
      const { decryptKeystoreToPem } = await import('@/contracts/poapContract');
      const pem = decryptKeystoreToPem(keystoreJson, password);
      onPemReady(pem);
      setPassword('');
    } catch (err) {
      setError(err?.message ?? 'Error desxifrant el wallet.');
    } finally {
      setLoading(false);
    }
  };

  // ── PEM tab ───────────────────────────────────────────────────────────────

  const handlePemFileChange = (e) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPemText(ev.target.result ?? '');
    reader.readAsText(file);
  };

  const handlePemSubmit = () => {
    setError('');
    if (!pemText.trim()) return setError('Enganxa o carrega el fitxer PEM.');
    onPemReady(pemText.trim());
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className='poap-key-importer'>
      {currentAddress && (
        <p className='poap-key-current'>
          ✅ Clau carregada: <span className='poap-mono'>{currentAddress.slice(0, 10)}…</span>
        </p>
      )}

      <div className='poap-tabs'>
        <button
          type='button'
          className={`poap-tab${tab === 'keystore' ? ' active' : ''}`}
          onClick={() => { setTab('keystore'); setError(''); }}
        >
          Wallet JSON
        </button>
        <button
          type='button'
          className={`poap-tab${tab === 'pem' ? ' active' : ''}`}
          onClick={() => { setTab('pem'); setError(''); }}
        >
          Fitxer PEM
        </button>
      </div>

      {tab === 'keystore' && (
        <div className='poap-tab-panel'>
          <p className='poap-muted'>
            Carrega el fitxer <strong>.json</strong> exportat des del{' '}
            <a
              href='https://devnet-wallet.multiversx.com'
              target='_blank'
              rel='noreferrer'
              className='poap-link'
            >
              MultiversX Web Wallet
            </a>{' '}
            i introdueix la teva contrasenya.
          </p>

          <input
            ref={fileRef}
            type='file'
            accept='.json,application/json'
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <PoapButton variant='secondary' onClick={() => fileRef.current?.click()}>
            {keystoreFilename || 'Seleccionar fitxer .json'}
          </PoapButton>

          {keystoreJson && (
            <>
              <label className='poap-label' style={{ marginTop: '0.75rem' }}>
                Contrasenya del wallet
              </label>
              <input
                className='poap-input'
                type='password'
                placeholder='Contrasenya'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleKeystoreSubmit()}
                autoComplete='current-password'
              />
              <PoapButton onClick={handleKeystoreSubmit} disabled={loading}>
                {loading ? 'Desxifrant...' : 'Importar wallet'}
              </PoapButton>
            </>
          )}
        </div>
      )}

      {tab === 'pem' && (
        <div className='poap-tab-panel'>
          <p className='poap-muted'>
            Carrega el fitxer <strong>.pem</strong> o enganxa el contingut directament.
          </p>

          <input
            type='file'
            accept='.pem,text/plain'
            style={{ display: 'none' }}
            id='pem-file-input'
            onChange={handlePemFileChange}
          />
          <PoapButton
            variant='secondary'
            onClick={() => document.getElementById('pem-file-input')?.click()}
          >
            Seleccionar fitxer .pem
          </PoapButton>

          <textarea
            className='poap-input poap-textarea'
            rows={5}
            placeholder={'-----BEGIN PRIVATE KEY for erd1...-----\n...\n-----END PRIVATE KEY for erd1...-----'}
            value={pemText}
            onChange={(e) => setPemText(e.target.value)}
          />
          <PoapButton onClick={handlePemSubmit}>Usar aquest PEM</PoapButton>
        </div>
      )}

      {error && <p className='poap-error'>{error}</p>}

      <p className='poap-muted poap-warning' style={{ marginTop: '0.5rem' }}>
        ⚠️ La clau viatjarà al QR de la classe. Entorn únicament didàctic.
      </p>
    </div>
  );
};
