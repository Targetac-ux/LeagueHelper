import { useEffect, useState } from 'react';

interface Suggestion {
  championId: number;
  championName: string;
  score: number;
  reasons: string[];
}

interface Props {
  sessionToken: string;
  onSelect: (championId: number) => void;
}

export function SuggestionsPanel({ sessionToken, onSelect }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = () => {
    setLoading(true);
    fetch('/api/champions/suggestions', {
      headers: { 'x-session-token': sessionToken },
    })
      .then((r) => r.json())
      .then((data) => {
        setSuggestions(data as Suggestion[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSuggestions();
  }, [sessionToken]);

  const maxScore = suggestions.length > 0 ? suggestions[0].score : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
          Champion Suggestions
        </p>
        <button
          onClick={fetchSuggestions}
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid #334155',
            background: '#1e293b',
            color: '#94a3b8',
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          Refresh
        </button>
      </div>

      {loading && (
        <p style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: 12 }}>
          Generating suggestions...
        </p>
      )}

      {!loading && suggestions.length === 0 && (
        <p style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: 12 }}>
          No suggestions available
        </p>
      )}

      {suggestions.map((s, idx) => {
        const barWidth = Math.max((s.score / maxScore) * 100, 5);
        const isTop = idx === 0;

        return (
          <button
            key={s.championId}
            onClick={() => onSelect(s.championId)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              padding: '8px 12px',
              borderRadius: 8,
              border: isTop ? '2px solid #f59e0b' : '1px solid #334155',
              background: '#1e293b',
              cursor: 'pointer',
              textAlign: 'left',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${barWidth}%`,
                background: isTop
                  ? 'linear-gradient(90deg, #f59e0b20, transparent)'
                  : 'linear-gradient(90deg, #3b82f610, transparent)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <span style={{ color: '#f1f5f9', fontSize: 13, fontWeight: isTop ? 700 : 500 }}>
                {idx + 1}. {s.championName}
              </span>
              <span style={{ color: isTop ? '#f59e0b' : '#3b82f6', fontSize: 12, fontWeight: 600 }}>
                {s.score}
              </span>
            </div>
            {s.reasons.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                {s.reasons.map((reason, ri) => {
                  const badgeColor = reason.startsWith('Counters')
                    ? '#ef4444'
                    : reason.startsWith('Synergizes')
                      ? '#22c55e'
                      : '#3b82f6';
                  return (
                    <span
                      key={ri}
                      style={{
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: `${badgeColor}20`,
                        color: badgeColor,
                        fontSize: 10,
                        fontWeight: 500,
                      }}
                    >
                      {reason}
                    </span>
                  );
                })}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
