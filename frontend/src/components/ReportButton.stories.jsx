import ReportButton from './ReportButton';
import { post } from '../stories/fixtures';

export default {
  title: 'Composants/ReportButton',
  component: ReportButton,
  args: { postId: post.id },
  // Shown in a post action bar, as in the Post component
  decorators: [
    (Story) => (
      <div className="card">
        <div className="post-actions">
          <button className="btn-light">👍 J'aime (3)</button>
          <button className="btn-light">💬 Commentaires (1)</button>
          <Story />
        </div>
      </div>
    ),
  ],
};

export const Ferme = { name: 'Fermé' };

export const ChoixDuMotif = {
  name: 'Choix du motif',
  args: { defaultOpen: true },
};
