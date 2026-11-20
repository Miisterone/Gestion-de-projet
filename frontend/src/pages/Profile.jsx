import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import Avatar from '../components/Avatar';
import Post from '../components/Post';
import StatsCard from '../components/profile/StatsCard';
import ZoneSelect from '../components/ZoneSelect';

export default function Profile({ user, setUser }) {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isMe, setIsMe] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [zones, setZones] = useState([]);
  const [zonesError, setZonesError] = useState('');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // Statistics are loaded apart: an error here must not hide the profile
  useEffect(() => {
    let ignore = false;
    setStats(null);
    setStatsError(null);
    setStatsLoading(true);

    api(`/users/${id}/stats`)
      .then((data) => !ignore && setStats(data))
      .catch((err) => !ignore && setStatsError(err))
      .finally(() => !ignore && setStatsLoading(false));

    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    setEditing(false);
    api(`/users/${id}`)
      .then((data) => {
        setProfile(data.user);
        setPosts(data.posts);
        setIsMe(data.isMe);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  function startEditing() {
    setForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      bio: profile.bio,
      avatar: profile.avatar,
      zoneId: profile.zoneId,
    });
    setSaveError('');
    setEditing(true);

    // The neighbourhood can be chosen here, for the accounts created before the zones
    setZonesError('');
    api('/zones')
      .then((data) => setZones(data.zones))
      .catch(() => setZonesError('Impossible de charger les quartiers. Réessayez dans un instant.'));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaveError('');
    // null: no neighbourhood chosen yet, the field is not sent
    const { zoneId, ...fields } = form;
    try {
      const data = await api('/users/me', { method: 'PUT', body: zoneId ? { ...fields, zoneId } : fields });
      setProfile(data.user);
      setUser(data.user);
      setEditing(false);
    } catch (err) {
      setSaveError(err.message);
    }
  }

  if (error) return <p className="error center">{error}</p>;
  if (!profile) return <p className="center">Chargement...</p>;

  return (
    <>
      <div className="card profile-header">
        <Avatar user={profile} size={100} />
        <h2>
          {profile.firstName} {profile.lastName}
        </h2>
        {profile.zone && <p className="zone">Quartier : {profile.zone.name}</p>}
        {profile.bio && <p>{profile.bio}</p>}

        {isMe && !editing && (
          <button className="btn-light" onClick={startEditing}>
            Modifier le profil
          </button>
        )}
      </div>

      <StatsCard
        stats={stats}
        isLoading={statsLoading}
        error={statsError}
        isMe={isMe}
      />

      {editing && (
        <form className="card edit-form" onSubmit={handleSave}>
          <div className="row">
            <input
              placeholder="Prénom"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <input
              placeholder="Nom"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
          <textarea
            placeholder="Bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
          <input
            placeholder="Lien de l'avatar (URL d'une image)"
            value={form.avatar}
            onChange={(e) => setForm({ ...form, avatar: e.target.value })}
          />
          <ZoneSelect
            zones={zones}
            value={form.zoneId}
            onChange={(zoneId) => setForm({ ...form, zoneId })}
            isLoading={!zonesError && zones.length === 0}
            error={zonesError}
            required={false}
          />
          {saveError && (
            <p className="error" role="alert">
              {saveError}
            </p>
          )}
          <div className="row">
            <button type="submit">Enregistrer</button>
            <button type="button" className="btn-light" onClick={() => setEditing(false)}>
              Annuler
            </button>
          </div>
        </form>
      )}

      <h3>Publications</h3>
      {posts.length === 0 && <p>Aucune publication.</p>}
      {posts.map((post) => (
        <Post
          key={post.id}
          post={post}
          user={user}
          onDeleted={(postId) => setPosts(posts.filter((p) => p.id !== postId))}
        />
      ))}
    </>
  );
}
