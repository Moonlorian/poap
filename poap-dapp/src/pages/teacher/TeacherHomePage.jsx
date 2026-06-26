import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { PoapButton } from '@/components/PoapButton';
import { hasMinimumEgld } from '@/api/devnetApi';
import { usePoapTransactions } from '@/contracts/poapContract';
import { useActiveEvent } from '@/hooks/useActiveEvent';
import { useOrganizerPem } from '@/hooks/useOrganizerPem';
import { getAccountProvider, useGetAccount } from '@/lib';
import { RouteNamesEnum } from '@/routes/routeNames';
import { formatDateTime } from '@/utils/dates';
import { EMBLEM_IMAGES, minEgld } from '@/config';

// ---------------------------------------------------------------------------
// CreateEventForm
// ---------------------------------------------------------------------------
const CreateEventForm = ({ onSuccess }) => {
  const { address } = useGetAccount();
  const { sendCreateEvent } = usePoapTransactions();
  const { pem, pemAddress, savePem, isValid: pemValid } = useOrganizerPem();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    imageUrl: EMBLEM_IMAGES?.[0]?.url ?? '',
    customUrl: '',
    useCustomUrl: false,
    endDate: '',
    maxParticipants: ''
  });
  const [pemInput, setPemInput] = useState(pem ?? '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    setError('');

    if (!form.name.trim()) return setError('El nom és obligatori.');
    const imageUrl = form.useCustomUrl ? form.customUrl.trim() : form.imageUrl;
    if (!imageUrl) return setError("Selecciona o introdueix una imatge.");
    if (!form.endDate) return setError('La data de finalització és obligatòria.');
    const endTs = new Date(form.endDate).getTime();
    if (isNaN(endTs) || endTs <= Date.now()) return setError('La data ha de ser futura.');
    const maxP = parseInt(form.maxParticipants, 10);
    if (!maxP || maxP < 1) return setError('El nombre de participants ha de ser > 0.');

    if (!savePem(pemInput)) return setError('La clau PEM no és vàlida.');

    if (pemAddress && pemAddress !== address) {
      setError(
        `La clau PEM correspon a ${pemAddress.slice(0, 8)}... però la wallet connectada és ${address.slice(0, 8)}...`
      );
      return;
    }

    setSubmitting(true);
    try {
      const hasBalance = await hasMinimumEgld(address);
      if (!hasBalance) {
        navigate(RouteNamesEnum.fundsGuide);
        return;
      }

      await sendCreateEvent({
        name: form.name.trim(),
        url: imageUrl,
        endDate: endTs,
        maxParticipants: maxP
      });

      onSuccess();
    } catch (err) {
      setError(err?.message ?? 'Error en crear la classe.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='poap-form-section'>
      <h3>Crear nova classe</h3>

      <label className='poap-label'>Nom de la classe</label>
      <input
        className='poap-input'
        type='text'
        placeholder='Ex: Matemàtiques — 12 juny'
        value={form.name}
        onChange={set('name')}
      />

      <label className='poap-label'>Imatge de l&apos;emblema</label>
      {!form.useCustomUrl ? (
        <>
          <div className='poap-emblem-selector'>
            {(EMBLEM_IMAGES ?? []).map((img) => (
              <button
                key={img.url}
                type='button'
                className={`poap-emblem-option${form.imageUrl === img.url ? ' selected' : ''}`}
                onClick={() => setForm((f) => ({ ...f, imageUrl: img.url }))}
              >
                <img src={img.url} alt={img.label} />
              </button>
            ))}
          </div>
          <button
            type='button'
            className='poap-text-btn'
            onClick={() => setForm((f) => ({ ...f, useCustomUrl: true }))}
          >
            Usar URL externa
          </button>
        </>
      ) : (
        <>
          <input
            className='poap-input'
            type='url'
            placeholder='https://exemple.com/imatge.png'
            value={form.customUrl}
            onChange={set('customUrl')}
          />
          <button
            type='button'
            className='poap-text-btn'
            onClick={() => setForm((f) => ({ ...f, useCustomUrl: false }))}
          >
            Triar de la llista
          </button>
        </>
      )}

      <label className='poap-label'>Data de finalització</label>
      <input
        className='poap-input'
        type='datetime-local'
        value={form.endDate}
        onChange={set('endDate')}
      />

      <label className='poap-label'>Nombre màxim de participants</label>
      <input
        className='poap-input'
        type='number'
        min='1'
        placeholder='30'
        value={form.maxParticipants}
        onChange={set('maxParticipants')}
      />

      <label className='poap-label'>
        Clau PEM de la wallet
        {pemAddress && pemValid && (
          <span className='poap-muted'> · {pemAddress.slice(0, 8)}…</span>
        )}
      </label>
      <textarea
        className='poap-input poap-textarea'
        rows={5}
        placeholder={'-----BEGIN PRIVATE KEY for erd1...-----\n...\n-----END PRIVATE KEY for erd1...-----'}
        value={pemInput}
        onChange={(e) => setPemInput(e.target.value)}
      />
      <p className='poap-muted poap-warning'>
        ⚠️ La clau PEM viatjarà al QR. Entorn únicament didàctic.
      </p>

      {error && <p className='poap-error'>{error}</p>}

      <PoapButton onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Creant classe...' : 'Crear classe'}
      </PoapButton>
    </div>
  );
};

// ---------------------------------------------------------------------------
// ActiveEventPanel
// ---------------------------------------------------------------------------
const ActiveEventPanel = ({ event, onFinalize, onShowQr }) => {
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState('');
  const { sendFinalizeEvent } = usePoapTransactions();

  const handleFinalize = async () => {
    if (!confirm('Segur que vols finalitzar la classe ara?')) return;
    setFinalizing(true);
    setError('');
    try {
      await sendFinalizeEvent();
      onFinalize();
    } catch (err) {
      setError(err?.message ?? 'Error en finalitzar.');
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className='poap-active-event'>
      <h3>Classe activa</h3>

      {event.emblemUrl && (
        <img className='poap-event-img' src={event.emblemUrl} alt={event.name} />
      )}

      <p className='poap-event-name'>{event.name}</p>
      <p className='poap-muted'>Inici: {formatDateTime(event.startDate * 1000)}</p>
      <p className='poap-muted'>Fi: {formatDateTime(event.endDate)}</p>
      <p className='poap-muted'>
        Participants: {event.currentParticipants} / {event.maxParticipants}
      </p>

      {error && <p className='poap-error'>{error}</p>}

      <PoapButton onClick={onShowQr}>Mostrar QR</PoapButton>
      <PoapButton variant='secondary' onClick={handleFinalize} disabled={finalizing}>
        {finalizing ? 'Finalitzant...' : 'Finalitzar classe'}
      </PoapButton>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export const TeacherHomePage = () => {
  const navigate = useNavigate();
  const { address } = useGetAccount();
  const { event, loading, refresh } = useActiveEvent(address);

  const handleLogout = async () => {
    const provider = getAccountProvider();
    await provider.logout();
    navigate(RouteNamesEnum.home);
  };

  return (
    <MobileLayout title='Professor' showBack onBack={() => navigate(RouteNamesEnum.role)}>
      <div className='poap-teacher'>
        {loading ? (
          <p className='poap-muted'>Carregant...</p>
        ) : event ? (
          <ActiveEventPanel
            event={event}
            onFinalize={refresh}
            onShowQr={() => navigate(RouteNamesEnum.teacherQr)}
          />
        ) : (
          <CreateEventForm onSuccess={refresh} />
        )}

        <PoapButton variant='secondary' onClick={handleLogout}>
          Sortir
        </PoapButton>
      </div>
    </MobileLayout>
  );
};