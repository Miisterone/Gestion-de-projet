import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Avatar from './Avatar';
import ReportButton from './ReportButton';

function formatDate(date) {
  return new Date(date).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function Post({ post, user, onDeleted }) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [comments, setComments] = useState(null);
  const [newComment, setNewComment] = useState('');

  async function handleLike() {
    const data = await api(`/posts/${post.id}/like`, { method: 'POST' });
    setLiked(data.liked);
    setLikesCount(data.likesCount);
  }

  async function handleDelete() {
    await api(`/posts/${post.id}`, { method: 'DELETE' });
    onDeleted(post.id);
  }

  async function toggleComments() {
    if (comments) {
      setComments(null);
      return;
    }
    const data = await api(`/posts/${post.id}/comments`);
    setComments(data.comments);
  }

  async function handleComment(e) {
    e.preventDefault();
    const data = await api(`/posts/${post.id}/comments`, {
      method: 'POST',
      body: { content: newComment },
    });
    setComments([...(comments || []), data.comment]);
    setCommentsCount(commentsCount + 1);
    setNewComment('');
  }

  return (
    <div className="card">
      <div className="post-header">
        <Avatar user={post.author} />
        <div>
          <Link to={`/profile/${post.author?.id}`} className="author">
            {post.author?.firstName} {post.author?.lastName}
          </Link>
          <div className="date">{formatDate(post.createdAt)}</div>
        </div>
        {post.author?.id === user.id && (
          <button className="btn-light delete" onClick={handleDelete}>
            Supprimer
          </button>
        )}
      </div>

      <p className="post-content">{post.content}</p>

      <div className="post-actions">
        <button className={liked ? 'btn-light liked' : 'btn-light'} onClick={handleLike}>
          👍 J'aime ({likesCount})
        </button>
        <button className="btn-light" onClick={toggleComments}>
          💬 Commentaires ({commentsCount})
        </button>
        {post.author?.id !== user.id && <ReportButton postId={post.id} />}
      </div>

      {comments && (
        <div className="comments">
          {comments.map((c) => (
            <div key={c.id} className="comment">
              <Avatar user={c.author} size={28} />
              <div className="comment-bubble">
                <strong>
                  {c.author?.firstName} {c.author?.lastName}
                </strong>
                <p>{c.content}</p>
              </div>
            </div>
          ))}
          <form className="comment-form" onSubmit={handleComment}>
            <input
              placeholder="Écrire un commentaire..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit" disabled={!newComment.trim()}>
              Envoyer
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
