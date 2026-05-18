import { useEffect, useState, useRef } from 'react';

interface Champion {
  id: string;
  name: string;
  image: string;
}

interface Props {
  pickableIds: number[];
  selectedId: number | null;
  onSelect: (championId: number) => void;
}

const DD_BASE = 'https://ddragon.leagueoflegends.com/cdn';

export function ChampionGrid({ pickableIds, selectedId, onSelect }: Props) {
  const [champions, setChampions] = useState<Record<string, Champion>>({});
  const [loading, setLoading] = useState(true);
  const ddVersionRef = useRef('15.5.1');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [verRes, champRes] = await Promise.all([
          fetch('/api/ddragon-version'),
          fetch('/api/champions'),
        ]);
        if (cancelled) return;
        if (verRes.ok) {
          const v = (await verRes.json()) as { version: string };
          ddVersionRef.current = v.version;
        }
        if (champRes.ok) {
          setChampions((await champRes.json()) as Record<string, Champion>);
        }
      } catch {
        // use defaults
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const ddVersion = ddVersionRef.current;

  const pickableChampions = pickableIds
    .map((id) => champions[String(id)])
    .filter((c): c is Champion => !!c);

  if (loading) {
    return <p style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center' }}>Loading champions...</p>;
  }

  return (
    <div>
      <p style={{ margin: '0 0 8px', color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
        Champions
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {pickableChampions.map((champ) => {
          const isSelected = selectedId === parseInt(champ.id, 10);
          return (
            <button
              key={champ.id}
              onClick={() => onSelect(parseInt(champ.id, 10))}
              style={{
                padding: 8,
                borderRadius: 8,
                border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
                background: isSelected ? '#3b82f650' : '#1e293b',
                cursor: 'pointer',
                color: '#f1f5f9',
                fontSize: 12,
                textAlign: 'center',
                WebkitTapHighlightColor: 'transparent',
                WebkitTouchCallout: 'none',
                outline: 'none',
              }}
            >
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: 6,
                  background: '#334155',
                  marginBottom: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  color: '#64748b',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={`${DD_BASE}/${ddVersion}/img/champion/${champ.image}`}
                  alt={champ.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 11,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: isSelected ? '#fff' : '#f1f5f9',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {champ.name}
              </div>
            </button>
          );
        })}
      </div>
      {pickableChampions.length === 0 && (
        <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', padding: 20 }}>
          No champions available
        </p>
      )}
    </div>
  );
}
