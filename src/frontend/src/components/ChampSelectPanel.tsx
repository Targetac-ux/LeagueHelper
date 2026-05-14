import { useEffect, useState } from 'react';
import { ChampionGrid } from './ChampionGrid';

interface ChampSelectSession {
  actions?: Array<Array<{ id: number; actorCellId: number; championId: number; type: string; completed: boolean }>>;
  myTeam?: Array<{ cellId: number; championId: number; selectedSkinId: number; spell1Id: number; spell2Id: number }>;
  localPlayerCellId?: number;
  pickableChampionIds?: number[];
  pickableSkinIds?: number[];
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

export function ChampSelectPanel({ sessionToken }: Props) {
  const [session, setSession] = useState<ChampSelectSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedChampion, setSelectedChampion] = useState<number | null>(null);
  const [spells, setSpells] = useState<{ s1: number; s2: number }>({ s1: 0, s2: 0 });

  const fetchSession = async () => {
    setError(null);
    try {
      const res = await fetch('/api/champ-select/session', {
        headers: { 'x-session-token': sessionToken },
      });
      if (res.ok) {
        const data = (await res.json()) as ChampSelectSession;
        setSession(data);
        const me = data.myTeam?.find((p) => p.cellId === data.localPlayerCellId);
        if (me) {
          setSelectedChampion(me.championId !== 0 ? me.championId : null);
          setSpells({ s1: me.spell1Id, s2: me.spell2Id });
        }
      } else {
        setError('Could not load champion select session');
      }
    } catch {
      setError('Failed to connect to server');
    }
  };

  useEffect(() => {
    fetchSession();
  }, [sessionToken]);

  const handleChampionSelect = async (championId: number) => {
    setSelectedChampion(championId);
    await fetch('/api/champ-select/my-selection', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken },
      body: JSON.stringify({ championId }),
    });
  };

  const handleSpellSelect = async (slot: 1 | 2, spellId: number) => {
    const updated = slot === 1 ? { s1: spellId, s2: spells.s2 } : { s1: spells.s1, s2: spellId };
    setSpells(updated);
    await fetch('/api/champ-select/my-selection', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken },
      body: JSON.stringify({ spell1Id: updated.s1, spell2Id: updated.s2 }),
    });
  };

  const handleLockIn = async () => {
    if (!session || !session.actions || session.localPlayerCellId === undefined) return;
    const myAction = session.actions
      .flat()
      .find((a) => a.actorCellId === session.localPlayerCellId && a.type === 'pick' && !a.completed);
    if (!myAction) return;
    await fetch(`/api/champ-select/action/${myAction.id}/complete`, {
      method: 'POST',
      headers: { 'x-session-token': sessionToken },
    });
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

  const pickableIds = session.pickableChampionIds ?? [];
  const hasPickableChampions = pickableIds.length > 0;
  const timeLeft = Math.max(0, session.timer?.timeLeftInPhase ?? 0);
  const hasAction = session.actions
    ?.flat()
    .some((a) => a.actorCellId === session.localPlayerCellId && a.type === 'pick' && !a.completed);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, color: '#3b82f6', fontWeight: 600, fontSize: 14 }}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </p>
        {hasAction && (
          <button
            onClick={handleLockIn}
            disabled={!selectedChampion}
            style={{
              padding: '8px 24px',
              borderRadius: 8,
              border: 'none',
              background: selectedChampion ? '#3b82f6' : '#334155',
              color: selectedChampion ? '#fff' : '#64748b',
              fontSize: 14,
              fontWeight: 600,
              cursor: selectedChampion ? 'pointer' : 'default',
            }}
          >
            Lock In
          </button>
        )}
      </div>

      {hasPickableChampions ? (
        <ChampionGrid
          pickableIds={pickableIds}
          selectedId={selectedChampion}
          onSelect={handleChampionSelect}
        />
      ) : (
        <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', padding: 16 }}>
          Champion selection not available for this game mode
        </p>
      )}

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
