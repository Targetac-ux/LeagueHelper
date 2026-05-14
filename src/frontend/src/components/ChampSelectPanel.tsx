import { useEffect, useState, useCallback } from 'react';
import { ChampionGrid } from './ChampionGrid';

interface ChampSelectSession {
  actions?: Array<Array<{ id: number; actorCellId: number; championId: number; type: string; completed: boolean }>>;
  myTeam?: Array<{ cellId: number; championId: number; selectedSkinId: number; spell1Id: number; spell2Id: number }>;
  theirTeam?: Array<{ cellId: number; championId: number }>;
  bans?: { myTeamBans: number[]; theirTeamBans: number[]; numBans: number };
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
  const [banPick, setBanPick] = useState<'ban' | 'pick' | null>(null);
  const [spells, setSpells] = useState<{ s1: number; s2: number }>({ s1: 0, s2: 0 });

  const fetchSession = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/api/champ-select/session', {
        headers: { 'x-session-token': sessionToken },
      });
      if (res.ok) {
        const data = (await res.json()) as ChampSelectSession;
        setSession(data);

        const myAction = data.actions?.flat().find((a) => a.actorCellId === data.localPlayerCellId && !a.completed);
        if (myAction?.type === 'ban') setBanPick('ban');
        else if (myAction?.type === 'pick') setBanPick('pick');
        else setBanPick(null);

        const me = data.myTeam?.find((p) => p.cellId === data.localPlayerCellId);
        if (me) {
          setSelectedChampion(me.championId !== 0 ? me.championId : null);
          setSpells({ s1: me.spell1Id, s2: me.spell2Id });
        }
      } else {
        setError('Could not load session');
      }
    } catch {
      setError('Failed to connect to server');
    }
  }, [sessionToken]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    fetchSession();
  }, [sessionToken, fetchSession]);

  const handleBanSelect = async (championId: number) => {
    setSelectedChampion(championId);
    await fetch('/api/champ-select/my-selection', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken },
      body: JSON.stringify({ championId }),
    });
  };

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
      .find((a) => a.actorCellId === session.localPlayerCellId && !a.completed);
    if (!myAction) return;
    await fetch(`/api/champ-select/action/${myAction.id}/complete`, {
      method: 'POST',
      headers: { 'x-session-token': sessionToken },
    });
    setTimeout(fetchSession, 1000);
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
  const myBan = session.bans?.myTeamBans ?? [];
  const theirBan = session.bans?.theirTeamBans ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ChampSelectTimeline
        myTeam={session.myTeam ?? []}
        theirTeam={session.theirTeam ?? []}
        myTeamBans={myBan}
        theirTeamBans={theirBan}
        localPlayerCellId={session.localPlayerCellId}
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
    </div>
  );
}

function ChampSelectTimeline({ myTeam, theirTeam, myTeamBans, theirTeamBans, localPlayerCellId }: {
  myTeam: Array<{ cellId: number; championId: number }>;
  theirTeam: Array<{ cellId: number; championId: number }> | undefined;
  myTeamBans: number[];
  theirTeamBans: number[];
  localPlayerCellId: number | undefined;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 8, borderRadius: 8, background: '#1e293b' }}>
      <TeamRow label="My Team" championIds={myTeam.map((p) => p.championId).filter((id) => id !== 0)} highlight={localPlayerCellId !== undefined ? myTeam.find((p) => p.cellId === localPlayerCellId)?.championId : undefined} />
      <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
        <span style={{ color: '#ef4444' }}>
          Bans: {myTeamBans.length > 0 ? myTeamBans.join(', ') : 'none'}
        </span>
      </div>
      {theirTeam && (
        <>
          <TeamRow label="Enemy Team" championIds={theirTeam.map((p) => p.championId).filter((id) => id !== 0)} highlight={undefined} />
          <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
            <span style={{ color: '#ef4444' }}>
              Bans: {theirTeamBans.length > 0 ? theirTeamBans.join(', ') : 'none'}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function TeamRow({ label, championIds, highlight }: { label: string; championIds: number[]; highlight: number | undefined }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ color: '#94a3b8', fontSize: 11, minWidth: 80 }}>{label}</span>
      <div style={{ display: 'flex', gap: 4 }}>
        {championIds.map((id) => (
          <span
            key={id}
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 11,
              background: id === highlight ? '#3b82f650' : '#334155',
              color: id === highlight ? '#3b82f6' : '#f1f5f9',
              fontWeight: id === highlight ? 600 : 400,
            }}
          >
            {id}
          </span>
        ))}
        {championIds.length === 0 && <span style={{ color: '#64748b', fontSize: 11 }}>pending...</span>}
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
