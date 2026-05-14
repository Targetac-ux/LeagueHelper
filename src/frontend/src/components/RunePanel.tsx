import { useEffect, useState } from 'react';
import type { PerkStyle, PerkPage } from '../../../shared/perks';
import { STAT_SHARD_SLOTS } from '../../../shared/perks';

interface Props {
  sessionToken: string;
}

export function RunePanel({ sessionToken }: Props) {
  const [styles, setStyles] = useState<PerkStyle[]>([]);
  const [primaryStyleId, setPrimaryStyleId] = useState<number>(8000);
  const [subStyleId, setSubStyleId] = useState<number>(8200);
  const [selectedPerks, setSelectedPerks] = useState<Record<string, number>>({});
  const [statShards, setStatShards] = useState<number[]>([5008, 5002, 5001]);
  const [pageName, setPageName] = useState('LeagueHelper');
  const [applying, setApplying] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/perks/data')
      .then((r) => r.json())
      .then((data) => setStyles(data as PerkStyle[]))
      .catch(() => {});
  }, []);

  const primaryStyle = styles.find((s) => s.id === primaryStyleId);
  const subStyle = styles.find((s) => s.id === subStyleId);

  const handleSelectPerk = (slotKey: string, perkId: number) => {
    setSelectedPerks((prev) => ({ ...prev, [slotKey]: perkId }));
  };

  const buildPerkIds = (): number[] => {
    const ids: number[] = [];
    if (!primaryStyle) return ids;
    for (const slot of primaryStyle.slots) {
      const selected = selectedPerks[`primary-${primaryStyle.id}-${primaryStyle.slots.indexOf(slot)}`];
      if (selected) ids.push(selected);
    }
    if (subStyle) {
      for (const slot of subStyle.slots.slice(1)) {
        const selected = selectedPerks[`secondary-${subStyle.id}-${subStyle.slots.indexOf(slot)}`];
        if (selected && ids.length < 6) ids.push(selected);
      }
    }
    ids.push(...statShards);
    return ids;
  };

  const handleApply = async () => {
    setApplying(true);
    setFeedback(null);
    const perkIds = buildPerkIds();
    if (perkIds.length < 6) {
      setFeedback('Please select all rune slots');
      setApplying(false);
      return;
    }
    try {
      const createRes = await fetch('/api/perks/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken },
        body: JSON.stringify({ name: pageName, primaryStyleId, subStyleId, selectedPerkIds: perkIds }),
      });
      if (!createRes.ok) {
        setFeedback('Failed to create page');
        setApplying(false);
        return;
      }
      const newPage = (await createRes.json()) as PerkPage;
      await fetch('/api/perks/currentpage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken },
        body: JSON.stringify({ id: newPage.id }),
      });
      setFeedback('Runes applied successfully!');
    } catch {
      setFeedback('Failed to apply runes');
    }
    setApplying(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ margin: 0, color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
        Rune Editor
      </p>

      <StyleSelector
        label="Primary"
        styles={styles}
        selectedId={primaryStyleId}
        onSelect={setPrimaryStyleId}
      />

      {primaryStyle && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {primaryStyle.slots.map((slot, idx) => (
            <RuneSlotRow
              key={`primary-${idx}`}
              label={idx === 0 ? 'Keystone' : `Slot ${idx + 1}`}
              runes={slot.runes}
              selectedId={selectedPerks[`primary-${primaryStyle.id}-${idx}`] || null}
              onSelect={(id) => handleSelectPerk(`primary-${primaryStyle.id}-${idx}`, id)}
            />
          ))}
        </div>
      )}

      <StyleSelector
        label="Secondary"
        styles={styles.filter((s) => s.id !== primaryStyleId)}
        selectedId={subStyleId}
        onSelect={setSubStyleId}
      />

      {subStyle && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {subStyle.slots.slice(1).map((slot, idx) => (
            <RuneSlotRow
              key={`secondary-${idx}`}
              label={`Secondary ${idx + 1}`}
              runes={slot.runes}
              selectedId={selectedPerks[`secondary-${subStyle.id}-${subStyle.slots.indexOf(slot)}`] || null}
              onSelect={(id) => handleSelectPerk(`secondary-${subStyle.id}-${subStyle.slots.indexOf(slot)}`, id)}
            />
          ))}
        </div>
      )}

      <p style={{ margin: '8px 0 4px', color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
        Stat Shards
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {STAT_SHARD_SLOTS.map((slot, idx) => (
          <StatShardRow
            key={`stat-${idx}`}
            shards={slot}
            selectedId={statShards[idx]}
            onSelect={(id) => setStatShards((prev) => { const n = [...prev]; n[idx] = id; return n; })}
          />
        ))}
      </div>

      <input
        value={pageName}
        onChange={(e) => setPageName(e.target.value)}
        placeholder="Page name"
        style={{
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid #334155',
          background: '#1e293b',
          color: '#f1f5f9',
          fontSize: 14,
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />

      <button
        onClick={handleApply}
        disabled={applying}
        style={{
          padding: '12px 0',
          borderRadius: 8,
          border: 'none',
          background: applying ? '#334155' : '#3b82f6',
          color: applying ? '#64748b' : '#fff',
          fontSize: 14,
          fontWeight: 600,
          cursor: applying ? 'default' : 'pointer',
        }}
      >
        {applying ? 'Applying...' : 'Apply Runes'}
      </button>

      {feedback && (
        <p style={{
          margin: 0,
          padding: 8,
          borderRadius: 6,
          textAlign: 'center',
          fontSize: 13,
          background: feedback === 'Runes applied successfully!' ? '#22c55e20' : '#ef444410',
          color: feedback === 'Runes applied successfully!' ? '#22c55e' : '#ef4444',
        }}>
          {feedback}
        </p>
      )}
    </div>
  );
}

function StyleSelector({ label, styles, selectedId, onSelect }: {
  label: string;
  styles: PerkStyle[];
  selectedId: number;
  onSelect: (id: number) => void;
}) {
  return (
    <div>
      <p style={{ margin: '8px 0 4px', color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style.id)}
            style={{
              flex: '1 0 auto',
              padding: '6px 12px',
              borderRadius: 6,
              border: selectedId === style.id ? '2px solid #3b82f6' : '2px solid transparent',
              background: selectedId === style.id ? '#3b82f620' : '#1e293b',
              color: '#f1f5f9',
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: selectedId === style.id ? 600 : 400,
            }}
          >
            {style.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function RuneSlotRow({ label, runes, selectedId, onSelect }: {
  label: string;
  runes: Array<{ id: number; name: string; icon: string }>;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <div>
      <p style={{ margin: '4px 0', color: '#64748b', fontSize: 11 }}>{label}</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {runes.map((rune) => (
          <button
            key={rune.id}
            onClick={() => onSelect(rune.id)}
            title={rune.name}
            style={{
              flex: '1 0 auto',
              padding: '6px 10px',
              borderRadius: 6,
              border: selectedId === rune.id ? '2px solid #3b82f6' : '1px solid #334155',
              background: selectedId === rune.id ? '#3b82f620' : '#1e293b',
              color: '#f1f5f9',
              fontSize: 11,
              cursor: 'pointer',
              fontWeight: selectedId === rune.id ? 600 : 400,
            }}
          >
            {rune.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatShardRow({ shards, selectedId, onSelect }: {
  shards: Array<{ id: number; name: string; icon: string }>;
  selectedId: number;
  onSelect: (id: number) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {shards.map((shard) => (
        <button
          key={shard.id}
          onClick={() => onSelect(shard.id)}
          style={{
            flex: 1,
            padding: '8px 4px',
            borderRadius: 6,
            border: selectedId === shard.id ? '2px solid #3b82f6' : '1px solid #334155',
            background: selectedId === shard.id ? '#3b82f620' : '#1e293b',
            color: '#f1f5f9',
            fontSize: 11,
            cursor: 'pointer',
            textAlign: 'center',
            fontWeight: selectedId === shard.id ? 600 : 400,
          }}
        >
          {shard.name}
        </button>
      ))}
    </div>
  );
}
