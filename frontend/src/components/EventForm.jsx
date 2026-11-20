import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

const EMPTY = { title: '', description: '', place: '', startsAt: '' };

// Value of a datetime-local input for the current minute (local time)
function nowForInput() {
  const now = new Date();
  now.setSeconds(0, 0);
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

// Creation of an event in the neighbourhood of the user (the API chooses the zone)
export default function EventForm({ user, onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  // Account without neighbourhood (LL_PROFILE_ZONE_409): the fix is in the profile
  const [needsZone, setNeedsZone] = useState(false);
  const [sending, setSending] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNeedsZone(false);
    setSending(true);
    try {
      // datetime-local gives a local time without offset: the API expects an ISO date
      const startsAt = form.startsAt ? new Date(form.startsAt).toISOString() : '';
      const data = await api('/events', { method: 'POST', body: { ...form, startsAt } });
      onCreated(data.event);
      setForm(EMPTY);
    } catch (err) {
      setError(err.message);
      setNeedsZone(err.code === 'LL_PROFILE_ZONE_409');
    } finally {
      setSending(false);
    }
  }

  const complete = form.title.trim() && form.description.trim() && form.place.trim() && form.startsAt;

  return (
    <form className="card event-form" onSubmit={handleSubmit}>
      <h3>Proposer un événement{user.zone && ` à ${user.zone.name}`}</h3>

      <label className="field-label" htmlFor="event-title">
        Titre
      </label>
      <input id="event-title" name="title" maxLength={100} value={form.title} onChange={handleChange} />

      <label className="field-label" htmlFor="event-startsAt">
        Date et heure
      </label>
      <input
        id="event-startsAt"
        name="startsAt"
        type="datetime-local"
        min={nowForInput()}
        value={form.startsAt}
        onChange={handleChange}
      />

      <label className="field-label" htmlFor="event-place">
        Lieu de rendez-vous
      </label>
      <input
        id="event-place"
        name="place"
        maxLength={100}
        placeholder="Ex. : Place du Salin"
        value={form.place}
        onChange={handleChange}
      />

      <label className="field-label" htmlFor="event-description">
        Description
      </label>
      <textarea
        id="event-description"
        name="description"
        rows={3}
        maxLength={1000}
        value={form.description}
        onChange={handleChange}
      />

      {error && (
        <p className="error" role="alert">
          {error}
          {needsZone && (
            <>
              {' '}
              <Link to={`/profile/${user.id}`}>Choisir mon quartier</Link>
            </>
          )}
        </p>
      )}
      <button type="submit" disabled={!complete || sending}>
        Créer l'événement
      </button>
    </form>
  );
}
