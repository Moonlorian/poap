import { useRef, useState } from 'react';
import { PoapButton } from '@/components/PoapButton';

export const KeyImporter = ({ onPemReady, currentAddress }) => {
  const [tab, setTab] = useState('keystore'); // 'keystore' | 'pem'
  const [pemText, setPemText] = useState('');
  const [keystoreJson, setKeystoreJson] = useState(null);
  const [keystoreFilename, setKeystoreFilename] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);
  const pemFileRef = useRef(null);

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

  const handleClearFile = () => {
    setKeystoreJson(null);
    setKeystoreFilename('');
    setPassword('');
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const FeedbackMessage = () => {
    return (
      <>
        {currentAddress && (
          <p className='poap-key-current'>
            Clau carregada: <span className='poap-mono'>{currentAddress.slice(0, 10)}…</span>
          </p>
        )}
        {error && <p className='poap-error'>{error}</p>}
      </>
    )
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

  return (
    <div className='poap-key-importer'>
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
            </a>
            .
          </p>

          <input
            ref={fileRef}
            type='file'
            accept='.json,application/json'
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <div className='poap-key-fieldgroup'>
            {!keystoreJson ? (
              <button
                type='button'
                className='poap-file-row poap-file-row--empty'
                onClick={() => fileRef.current?.click()}
              >
                <span className='poap-file-row-icon' aria-hidden='true'>📄</span>
                <span className='poap-file-row-text'>Selecciona el fitxer .json</span>
              </button>
            ) : (
              <div className='poap-file-row poap-file-row--filled'>
                <span className='poap-file-row-icon' aria-hidden='true'>📄</span>
                <span className='poap-file-row-name' title={keystoreFilename}>
                  {keystoreFilename}
                </span>
                <button
                  type='button'
                  className='poap-file-row-change'
                  onClick={handleClearFile}
                >
                  Canviar
                </button>
              </div>
            )}

            {keystoreJson && (
              <>
                <input
                  className='poap-input'
                  type='password'
                  placeholder='Contrasenya del wallet'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleKeystoreSubmit()}
                  autoComplete='current-password'
                />
                <PoapButton
                  variant='secondary'
                  onClick={handleKeystoreSubmit}
                  disabled={loading}
                  className='poap-btn-block'
                >
                  {loading ? 'Desxifrant...' : 'Importar wallet'}
                </PoapButton>
              </>
            )}
          </div>
        </div>      
      )}

      {tab === 'pem' && (
        <div className='poap-tab-panel'>
          <p className='poap-muted'>
            Carrega el fitxer <strong>.pem</strong> o enganxa el contingut directament.
          </p>

          <input
            ref={pemFileRef}
            type='file'
            accept='.pem,text/plain'
            style={{ display: 'none' }}
            onChange={handlePemFileChange}
          />
        
          <div className='poap-key-fieldgroup'>
            <button
              type='button'
              className='poap-file-row poap-file-row--empty'
              onClick={() => pemFileRef.current?.click()}
            >
              <span className='poap-file-row-icon' aria-hidden='true'>📄</span>
              <span className='poap-file-row-text'>Selecciona el fitxer .pem (opcional)</span>
            </button>

            <textarea
              className='poap-input poap-textarea'
              rows={4}
              placeholder={'-----BEGIN PRIVATE KEY for erd1...-----\n...\n-----END PRIVATE KEY for erd1...-----'}
              value={pemText}
              onChange={(e) => setPemText(e.target.value)}
            />
            <PoapButton
              variant='secondary'
              onClick={handlePemSubmit}
              className='poap-btn-block'
            >
              Utilitzar aquest PEM
            </PoapButton>
          </div>
        </div>        
      )}
          <FeedbackMessage/>
    </div>
  );
};