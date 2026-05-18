import { useEffect, useState, useCallback, useRef } from 'react';
import { ChampionGrid } from './ChampionGrid';

interface BanObject {
  championId: number;
  pickTurn: number;
}

interface ChampSelectSession {
  actions?: Array<Array<{ id: number; actorCellId: number; championId: number; type: string; completed: boolean }>>;
  myTeam?: Array<{ cellId: number; championId: number; spell1Id: number; spell2Id: number }>;
  theirTeam?: Array<{ cellId: number; championId: number }>;
  bans?: { myTeamBans: BanObject[]; theirTeamBans: BanObject[]; numBans: number };
  localPlayerCellId?: number;
  pickableChampionIds?: number[];
  timer?: { timeLeftInPhase: number; phase: string };
}

interface Props {
  sessionToken: string;
  data: unknown;
}

const SPELL_IDS: Record<number, string> = {
  1: 'Cleanse', 3: 'Exhaust', 4: 'Flash', 6: 'Ghost',
  7: 'Heal', 11: 'Smite', 12: 'Teleport', 13: 'Clarity',
  14: 'Ignite', 21: 'Barrier', 30: 'Mark',
};

export function ChampSelectPanel({ sessionToken, data }: Props) {
  const [session, setSession] = useState<ChampSelectSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [championNames, setChampionNames] = useState<Record<string, string>>({});
  const [selectedChampion, setSelectedChampion] = useState<number | null>(null);
  const [banPick, setBanPick] = useState<'ban' | 'pick' | null>(null);
  const [spells, setSpells] = useState<{ s1: number; s2: number }>({ s1: 0, s2: 0 });
  const [feedback, setFeedback] = useState<string | null>(null);
  const lastDataRef = useRef<unknown>(null);

  useEffect(() => {
    fetch('/api/champions')
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, string> = {};
        for (const [id, c] of Object.entries(data as Record<string, { name: string }>)) {
          map[id] = c.name;
        }
        setChampionNames(map);
      })
      .catch(() => {});
  }, []);

  const updateFromSession = useCallback((s: ChampSelectSession) => {
    setSession(s);
    const myAction = s.actions?.flat().find((a) => a.actorCellId === s.localPlayerCellId && !a.completed);
    if (myAction?.type === 'ban') setBanPick('ban');
    else if (myAction?.type === 'pick') setBanPick('pick');
    else setBanPick(null);
    const me = s.myTeam?.find((p) => p.cellId === s.localPlayerCellId);
    if (me) {
      setSelectedChampion(me.championId !== 0 ? me.championId : null);
      setSpells({ s1: me.spell1Id, s2: me.spell2Id });
    }
  }, []);

  const fetchSession = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/api/champ-select/session', {
        headers: { 'x-session-token': sessionToken },
      });
      if (res.ok) {
        const s = (await res.json()) as ChampSelectSession;
        updateFromSession(s);
      } else {
        setError('Could not load session');
      }
    } catch {
      setError('Failed to connect to server');
    }
  }, [sessionToken, updateFromSession]);

  useEffect(() => { fetchSession(); }, [fetchSession]);

  useEffect(() => {
    if (!data || data === lastDataRef.current) return;
    lastDataRef.current = data;
    const s = data as ChampSelectSession;
    if (s.actions || s.myTeam) {
      updateFromSession(s);
    }
  }, [data, updateFromSession]);

  const doAction = async (championId: number) => {
    setSelectedChampion(championId);
    setFeedback(null);
    try {
      const res = await fetch('/api/champ-select/my-selection', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken },
        body: JSON.stringify({ championId }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string; details?: string };
        setFeedback(err.details || err.error || 'Selection failed');
      }
    } catch {
      setFeedback('Network error');
    }
  };

  const handleBanSelect = (championId: number) => doAction(championId);
  const handleChampionSelect = (championId: number) => doAction(championId);

  const handleSpellSelect = async (slot: 1 | 2, spellId: number) => {
    const updated = slot === 1 ? { s1: spellId, s2: spells.s2 } : { s1: spells.s1, s2: spellId };
    setSpells(updated);
    try {
      const res = await fetch('/api/champ-select/my-selection', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken },
        body: JSON.stringify({ spell1Id: updated.s1, spell2Id: updated.s2 }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        setFeedback(err.error || 'Spell update failed');
      }
    } catch {
      setFeedback('Network error');
    }
  };

  const handleLockIn = async () => {
    if (!session || !session.actions || session.localPlayerCellId === undefined) return;
    setFeedback(null);
    const myAction = session.actions
      .flat()
      .find((a) => a.actorCellId === session.localPlayerCellId && !a.completed);
    if (!myAction) {
      setFeedback('No pending action found');
      return;
    }
    try {
      const res = await fetch(`/api/champ-select/action/${myAction.id}/complete`, {
        method: 'POST',
        headers: { 'x-session-token': sessionToken },
      });
      if (res.ok) {
        setTimeout(fetchSession, 500);
      } else {
        const err = (await res.json()) as { error?: string; details?: string };
        setFeedback(err.details || err.error || 'Action failed');
      }
    } catch {
      setFeedback('Network error');
    }
  };

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 20 }}>
        <p style={{ color: '#ef4444', fontSize: 14, margin: '0 0 12px' }}>{error}</p>
        <button onClick={fetchSession} style={{ padding: '8px 24px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 14, cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    );
  }

  if (!session) {
    return <p style={{ color: '#94a3b8', textAlign: 'center' }}>Loading champion select...</p>;
  }

  const timeLeft = Math.max(0, session.timer?.timeLeftInPhase ?? 0);
  const pickableIds = session.pickableChampionIds ?? [];
  const myBanIds = (session.bans?.myTeamBans ?? []).map((b) => b.championId);
  const theirBanIds = (session.bans?.theirTeamBans ?? []).map((b) => b.championId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ChampSelectTimeline
        myTeam={session.myTeam ?? []}
        theirTeam={session.theirTeam ?? []}
        myTeamBanIds={myBanIds}
        theirTeamBanIds={theirBanIds}
        localPlayerCellId={session.localPlayerCellId}
        championNames={championNames}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, color: '#3b82f6', fontWeight: 600, fontSize: 14 }}>
          {banPick === 'ban' ? 'Ban Phase' : banPick === 'pick' ? 'Pick Phase' : 'Waiting...'}
          {' — '}{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </p>
        {banPick && (
          <button
            onClick={handleLockIn}
            disabled={!selectedChampion}
            style={{
              padding: '8px 24px',
              borderRadius: 8,
              border: 'none',
              background: selectedChampion ? (banPick === 'ban' ? '#ef4444' : '#22c55e') : '#334155',
              color: selectedChampion ? '#fff' : '#64748b',
              fontSize: 14,
              fontWeight: 600,
              cursor: selectedChampion ? 'pointer' : 'default',
            }}
          >
            {banPick === 'ban' ? 'Ban' : 'Lock In'}
          </button>
        )}
      </div>

      {banPick === 'ban' && (
        <ChampionGrid
          pickableIds={pickableIds}
          selectedId={selectedChampion}
          onSelect={handleBanSelect}
        />
      )}

      {banPick === 'pick' && (
        <>
          <ChampionGrid
            pickableIds={pickableIds}
            selectedId={selectedChampion}
            onSelect={handleChampionSelect}
          />

          <div>
            <p style={{ margin: '0 0 8px', color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              Summoner Spells
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[spells.s1, spells.s2].map((spellId, idx) => (
                <SpellSlot
                  key={idx}
                  slot={(idx + 1) as 1 | 2}
                  spellId={spellId}
                  onSelect={(id) => handleSpellSelect((idx + 1) as 1 | 2, id)}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {!banPick && pickableIds.length > 0 && (
        <ChampionGrid
          pickableIds={pickableIds}
          selectedId={selectedChampion}
          onSelect={handleChampionSelect}
        />
      )}

      {feedback && (
        <p style={{
          margin: 0, padding: 8, borderRadius: 6, textAlign: 'center', fontSize: 13,
          background: feedback.includes('success') || feedback.includes('ok') ? '#22c55e20' : '#ef444410',
          color: feedback.includes('success') || feedback.includes('ok') ? '#22c55e' : '#ef4444',
        }}>
          {feedback}
        </p>
      )}
    </div>
  );
}

function ChampSelectTimeline({ myTeam, theirTeam, myTeamBanIds, theirTeamBanIds, localPlayerCellId, championNames }: {
  myTeam: Array<{ cellId: number; championId: number }>;
  theirTeam: Array<{ cellId: number; championId: number }> | undefined;
  myTeamBanIds: number[];
  theirTeamBanIds: number[];
  localPlayerCellId: number | undefined;
  championNames: Record<string, string>;
}) {
  const getName = (id: number) => championNames[String(id)] ?? `#${id}`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 8, borderRadius: 8, background: '#1e293b' }}>
      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>My Team</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {myTeam.map((p) => {
          const isMe = p.cellId === localPlayerCellId;
          return (
            <span
              key={p.cellId}
              style={{
                padding: '2px 8px', borderRadius: 4, fontSize: 11,
                background: isMe ? '#3b82f650' : '#334155',
                color: '#f1f5f9', fontWeight: isMe ? 600 : 400,
              }}
            >
              {getName(p.championId)}
              {isMe ? ' (you)' : ''}
            </span>
          );
        })}
        {myTeam.length === 0 && <span style={{ color: '#64748b', fontSize: 11 }}>pending...</span>}
      </div>

      <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, marginTop: 2 }}>My Bans</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {myTeamBanIds.map((id) => (
          <span key={id} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, background: '#ef444420', color: '#ef4444' }}>
            {getName(id)}
          </span>
        ))}
        {myTeamBanIds.length === 0 && <span style={{ color: '#64748b', fontSize: 11 }}>none yet</span>}
      </div>

      {theirTeam && (
        <>
          <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600, marginTop: 4 }}>Enemy Team</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {theirTeam.map((p) => (
              <span key={p.cellId} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, background: '#334155', color: '#f1f5f9' }}>
                {getName(p.championId)}
              </span>
            ))}
            {theirTeam.length === 0 && <span style={{ color: '#64748b', fontSize: 11 }}>pending...</span>}
          </div>

          <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600, marginTop: 2 }}>Enemy Bans</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {theirTeamBanIds.map((id) => (
              <span key={id} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, background: '#f59e0b20', color: '#f59e0b' }}>
                {getName(id)}
              </span>
            ))}
            {theirTeamBanIds.length === 0 && <span style={{ color: '#64748b', fontSize: 11 }}>none yet</span>}
          </div>
        </>
      )}
    </div>
  );
}

function SpellSlot({ slot, spellId, onSelect }: { slot: 1 | 2; spellId: number; onSelect: (id: number) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '12px 0',
          borderRadius: 8,
          border: '1px solid #334155',
          background: '#1e293b',
          color: '#f1f5f9',
          fontSize: 13,
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          outline: 'none',
        }}
      >
        {spellId ? SPELL_IDS[spellId] || `Spell ${spellId}` : `Slot ${slot}`}
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            right: 0,
            maxHeight: 200,
            overflowY: 'auto',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            zIndex: 10,
          }}
        >
          {Object.entries(SPELL_IDS).map(([id, name]) => (
            <button
              key={id}
              onClick={() => {
                onSelect(parseInt(id, 10));
                setOpen(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: spellId === parseInt(id, 10) ? '#3b82f620' : 'transparent',
                color: '#f1f5f9',
                fontSize: 12,
                cursor: 'pointer',
                textAlign: 'left',
                WebkitTapHighlightColor: 'transparent',
                outline: 'none',
              }}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
