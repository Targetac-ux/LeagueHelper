import { useEffect, useState } from 'react';

interface Profile {
  id: number;
  name: string;
  preferredChampionIds: number[];
  runePageId: number | null;
  autoMode: boolean;
}

interface Champion {
  id: string;
  name: string;
  image: string;
}

interface Props {
  sessionToken: string;
  onProfileChange: () => void;
}

export function ProfileManager({ sessionToken, onProfileChange }: Props) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [champions, setChampions] = useState<Record<string, Champion>>({});
  const [champSearch, setChampSearch] = useState('');

  useEffect(() => {
    fetch('/api/champions')
      .then((r) => r.json())
      .then((data) => setChampions(data as Record<string, Champion>));
  }, []);

  const load = () => {
    fetch('/api/profiles', { headers: { 'x-session-token': sessionToken } })
      .then((r) => r.json())
      .then((data) => setProfiles(data as Profile[]));
    fetch('/api/profiles/active', { headers: { 'x-session-token': sessionToken } })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.id) setActiveId(data.id);
      });
  };

  useEffect(load, [sessionToken]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setNewName('');
    load();
    onProfileChange();
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/profiles/${id}`, {
      method: 'DELETE',
      headers: { 'x-session-token': sessionToken },
    });
    if (activeId === id) setActiveId(null);
    load();
    onProfileChange();
  };

  const handleActivate = async (id: number) => {
    await fetch(`/api/profiles/${id}/activate`, {
      method: 'PUT',
      headers: { 'x-session-token': sessionToken },
    });
    setActiveId(id);
    load();
    onProfileChange();
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;
    await fetch(`/api/profiles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken },
      body: JSON.stringify({ name: editName.trim() }),
    });
    setEditingId(null);
    load();
  };

  const handleSetPreferred = async (profileId: number, championId: number) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;
    const current = profile.preferredChampionIds || [];
    const updated = current.includes(championId)
      ? current.filter((id) => id !== championId)
      : [championId];
    await fetch(`/api/profiles/${profileId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken },
      body: JSON.stringify({ preferredChampionIds: updated }),
    });
    load();
    onProfileChange();
  };

  const championList = Object.entries(champions)
    .map(([id, c]) => ({ ...c, id: parseInt(id, 10) }))
    .filter((c) => c.name.toLowerCase().includes(champSearch.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ margin: 0, color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
        Profiles
      </p>

      {profiles.map((p) => (
        <div key={p.id}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 8,
              border: activeId === p.id ? '2px solid #3b82f6' : '1px solid #334155',
              background: activeId === p.id ? '#3b82f610' : '#1e293b',
            }}
          >
            {editingId === p.id ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => handleUpdate(p.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdate(p.id)}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  borderRadius: 4,
                  border: '1px solid #334155',
                  background: '#0f172a',
                  color: '#f1f5f9',
                  fontSize: 13,
                  outline: 'none',
                }}
                autoFocus
              />
            ) : (
              <span
                style={{ flex: 1, color: '#f1f5f9', fontSize: 13, cursor: 'pointer' }}
                onClick={() => { setEditingId(p.id); setEditName(p.name); }}
              >
                {p.name}
                {p.autoMode ? ' 🤖' : ''}
              </span>
            )}
            <button
              onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
              style={{
                padding: '4px 6px',
                borderRadius: 4,
                border: '1px solid #334155',
                background: 'transparent',
                color: '#94a3b8',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              {expandedId === p.id ? '▲' : '▼'}
            </button>
            <button
              onClick={() => handleActivate(p.id)}
              disabled={activeId === p.id}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                border: 'none',
                background: activeId === p.id ? '#334155' : '#3b82f6',
                color: activeId === p.id ? '#64748b' : '#fff',
                fontSize: 11,
                cursor: activeId === p.id ? 'default' : 'pointer',
              }}
            >
              {activeId === p.id ? 'Active' : 'Use'}
            </button>
            <button
              onClick={() => handleDelete(p.id)}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                border: 'none',
                background: '#ef444420',
                color: '#ef4444',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              Del
            </button>
          </div>

          {expandedId === p.id && (
            <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 11 }}>
                Preferred Champion {p.preferredChampionIds?.[0] ? `(ID: ${p.preferredChampionIds[0]})` : '(none set)'}
              </p>
              <input
                value={champSearch}
                onChange={(e) => setChampSearch(e.target.value)}
                placeholder="Search champions..."
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #334155',
                  background: '#0f172a',
                  color: '#f1f5f9',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxHeight: 150, overflowY: 'auto' }}>
                {championList.slice(0, 30).map((c) => {
                  const isSelected = p.preferredChampionIds?.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSetPreferred(p.id, c.id)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        border: isSelected ? '2px solid #3b82f6' : '1px solid #334155',
                        background: isSelected ? '#3b82f620' : '#1e293b',
                        color: '#f1f5f9',
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="New profile name"
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #334155',
            background: '#1e293b',
            color: '#f1f5f9',
            fontSize: 13,
            outline: 'none',
          }}
        />
        <button
          onClick={handleCreate}
          disabled={!newName.trim()}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: 'none',
            background: newName.trim() ? '#3b82f6' : '#334155',
            color: newName.trim() ? '#fff' : '#64748b',
            fontSize: 13,
            cursor: newName.trim() ? 'pointer' : 'default',
          }}
        >
          Create
        </button>
      </div>
    </div>
  );
}
