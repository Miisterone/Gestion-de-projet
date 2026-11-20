import { useState } from 'react';
import { api } from '../api';

// Same values as the reasons accepted by POST /api/reports
export const REASONS = [
  { value: 'abus', label: 'Abus ou harcèlement' },
  { value: 'inapproprie', label: 'Contenu inapproprié' },
  { value: 'erronee', label: 'Information erronée' },
  { value: 'autre', label: 'Autre' },
];

// "Signaler" button of a post: choice of a reason, then a confirmation.
// Rendered inside .post-actions: the panel takes a full line under the buttons.
export default function ReportButton({ postId, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState('');
  const [error, setError] = useState('');

  function close() {
    setOpen(false);
    setReason('');
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await api('/reports', { method: 'POST', body: { postId, reason } });
      setDone('Signalement envoyé, merci. Il sera examiné par la modération.');
      setOpen(false);
    } catch (err) {
      // Already reported: nothing more to do, the message says so
      if (err.code === 'LL_REPORT_409') {
        setDone(err.message);
        setOpen(false);
      } else {
        setError(err.message);
      }
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <p className="report-done" role="status">
        {done}
      </p>
    );
  }

  return (
    <>
      <button
        type="button"
        className="btn-light report-toggle"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        🚩 Signaler
      </button>

      {open && (
        <form className="report-panel" onSubmit={handleSubmit}>
          <fieldset>
            <legend>Pourquoi signaler cette publication ?</legend>
            {REASONS.map((r) => (
              <label key={r.value} className="report-reason">
                <input
                  type="radio"
                  name={`reason-${postId}`}
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                />
                {r.label}
              </label>
            ))}
          </fieldset>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="row">
            <button type="submit" disabled={!reason || sending}>
              Envoyer le signalement
            </button>
            <button type="button" className="btn-light" onClick={close}>
              Annuler
            </button>
          </div>
        </form>
      )}
    </>
  );
}
