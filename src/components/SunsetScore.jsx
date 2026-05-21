import { getScoreTier } from '../utils/sunsetScore';

export default function SunsetScore({ score, breakdown, compact = false }) {
  const tier = getScoreTier(score ?? 0);

  if (compact) {
    return (
      <span className="sunset-score sunset-score--compact" style={{ color: tier.color }}>
        {tier.emoji} {score ?? '—'}
      </span>
    );
  }

  const bars = breakdown ? [
    { label: 'Clouds', value: breakdown.clouds },
    { label: 'Humidity', value: breakdown.humidity },
    { label: 'Visibility', value: breakdown.visibility },
    { label: 'Timing', value: breakdown.proximity },
  ] : [];

  return (
    <div className="sunset-score">
      <div className="sunset-score__ring" style={{ '--tier-color': tier.color }}>
        <span className="sunset-score__value" style={{ color: tier.color }}>{score ?? '—'}</span>
        <span className="sunset-score__label">{tier.label}</span>
      </div>

      {bars.length > 0 && (
        <ul className="sunset-score__breakdown">
          {bars.map(({ label, value }) => (
            <li key={label}>
              <div className="breakdown-row">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
              <div className="breakdown-bar-track">
                <div
                  className="breakdown-bar-fill"
                  style={{ width: `${value}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}