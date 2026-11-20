import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api } from '../api';
import ReportButton from './ReportButton';
import { post } from '../stories/fixtures';

vi.mock('../api', async (importOriginal) => ({ ...(await importOriginal()), api: vi.fn() }));

async function report(reason) {
  await userEvent.click(screen.getByRole('button', { name: /Signaler/ }));
  await userEvent.click(screen.getByLabelText(reason));
  await userEvent.click(screen.getByRole('button', { name: 'Envoyer le signalement' }));
}

describe('ReportButton', () => {
  // Braces matter: a function returned by beforeEach is run by Vitest as a cleanup
  beforeEach(() => {
    api.mockReset();
  });

  it('sends the chosen reason and confirms', async () => {
    api.mockResolvedValue({ report: { id: 'r1' } });
    render(<ReportButton postId={post.id} />);

    await report('Information erronée');

    expect(api).toHaveBeenCalledWith('/reports', { method: 'POST', body: { postId: post.id, reason: 'erronee' } });
    expect(screen.getByRole('status')).toHaveTextContent('Signalement envoyé');
    expect(screen.queryByRole('button', { name: /Signaler/ })).not.toBeInTheDocument();
  });

  it('cannot be sent without a reason, and can be cancelled', async () => {
    render(<ReportButton postId={post.id} />);

    await userEvent.click(screen.getByRole('button', { name: /Signaler/ }));
    expect(screen.getByRole('button', { name: 'Envoyer le signalement' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(screen.queryByText('Pourquoi signaler cette publication ?')).not.toBeInTheDocument();
    expect(api).not.toHaveBeenCalled();
  });

  it('says so when the post was already reported', async () => {
    api.mockRejectedValue(
      new ApiError({ code: 'LL_REPORT_409', status: 409, title: 'Vous avez déjà signalé ce contenu.' })
    );
    render(<ReportButton postId={post.id} />);

    await report('Autre');

    expect(screen.getByRole('status')).toHaveTextContent('Vous avez déjà signalé ce contenu.');
  });

  it('shows other errors and keeps the choice to retry', async () => {
    api.mockRejectedValue(
      new ApiError({ code: 'LL_NETWORK', status: 0, title: 'Connexion perdue. Vérifiez votre réseau.' })
    );
    render(<ReportButton postId={post.id} />);

    await report('Abus ou harcèlement');

    expect(screen.getByRole('alert')).toHaveTextContent('Connexion perdue');
    expect(screen.getByLabelText('Abus ou harcèlement')).toBeChecked();
  });
});
