import { useEffect, useState } from "react";
import { fileUrl } from "../lib/api";

export const RightPanel = ({ user, onUpdateProfile, onLogout }) => {
  const [form, setForm] = useState({
    name: user.name,
    bio: user.bio || "",
    avatar: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: user.name,
      bio: user.bio || "",
      avatar: null,
    });
  }, [user]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    await onUpdateProfile(form);
    setSaving(false);
    setForm((current) => ({ ...current, avatar: null }));
  };

  return (
    <aside className="right-panel">
      <div className="profile-card">
        {user.avatar ? (
          <img src={fileUrl(user.avatar)} alt={user.name} className="profile-avatar" />
        ) : (
          <div className="profile-avatar placeholder large">{user.name.slice(0, 1)}</div>
        )}
        <h3>{user.name}</h3>
        <p>{user.email}</p>
      </div>

      <form className="profile-form" onSubmit={submit}>
        <h4>Edit profile</h4>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Full name"
        />
        <textarea
          rows="4"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          placeholder="Short bio"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setForm({ ...form, avatar: e.target.files?.[0] || null })}
        />
        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>

      <button className="logout-button" onClick={onLogout}>
        Logout
      </button>
    </aside>
  );
};
