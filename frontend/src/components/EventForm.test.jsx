import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api } from '../api';
import EventForm from './EventForm';
import { event, gerard } from '../stories/fixtures';

vi.mock('../api', async (importOriginal) => ({ ...(await importOriginal()), api: vi.fn() }));

async function fill() {
  await userEvent.type(screen.getByLabelText('Titre'), 'Fête des voisins');
  await userEvent.type(screen.getByLabelText('Date et heure'), '2030-06-21T19:30');
  await userEvent.type(screen.getByLabelText('Lieu de rendez-vous'), 'Place du Salin');
  await userEvent.type(screen.getByLabelText('Description'), 'Chacun apporte un plat.');
}

describe('EventForm', () => {
  // Braces matter: a function returned by beforeEach is run by Vitest as a cleanup
  beforeEach(() => {
    api.mockReset();
  });

  it('sends the event with an ISO date and empties the form', async () => {
    api.mockResolvedValue({ event });
    const onCreated = vi.fn();
    render(<EventForm user={gerard} onCreated={onCreated} />);

    await fill();
    await userEvent.click(screen.getByRole('button', { name: "Créer l'événement" }));

    expect(api).toHaveBeenCalledWith('/events', {
      method: 'POST',
      body: {
        title: 'Fête des voisins',
        description: 'Chacun apporte un plat.',
        place: 'Place du Salin',
        startsAt: new Date('2030-06-21T19:30').toISOString(),
      },
    });
    expect(onCreated).toHaveBeenCalledWith(event);
    expect(screen.getByLabelText('Titre')).toHaveValue('');
  });

  it('cannot be sent while a field is empty', async () => {
    render(<EventForm user={gerard} onCreated={() => {}} />);

    await userEvent.type(screen.getByLabelText('Titre'), 'Fête des voisins');

    expect(screen.getByRole('button', { name: "Créer l'événement" })).toBeDisabled();
  });

  it('shows the message of the API and keeps the input', async () => {
    api.mockRejectedValue(
      new ApiError({
        code: 'LL_VALIDATION_422',
        status: 422,
        title: 'Certains champs sont invalides.',
        errors: [{ field: 'startsAt', code: 'INVALID_VALUE', message: 'La date doit être dans le futur.' }],
      })
    );
    render(<EventForm user={gerard} onCreated={() => {}} />);

    await fill();
    await userEvent.click(screen.getByRole('button', { name: "Créer l'événement" }));

    expect(await screen.findByRole('alert')).toHaveTextContent('La date doit être dans le futur.');
    expect(screen.getByLabelText('Titre')).toHaveValue('Fête des voisins');
  });

  it('links to the profile when the account has no neighbourhood', async () => {
    api.mockRejectedValue(
      new ApiError({
        code: 'LL_PROFILE_ZONE_409',
        status: 409,
        title: 'Choisissez votre quartier dans votre profil pour continuer.',
      })
    );
    render(
      <MemoryRouter>
        <EventForm user={{ ...gerard, zoneId: null, zone: null }} onCreated={() => {}} />
      </MemoryRouter>
    );

    await fill();
    await userEvent.click(screen.getByRole('button', { name: "Créer l'événement" }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Choisissez votre quartier dans votre profil');
    expect(screen.getByRole('link', { name: 'Choisir mon quartier' })).toHaveAttribute('href', `/profile/${gerard.id}`);
  });
});
