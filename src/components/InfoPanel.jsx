import SunsetScore from './SunsetScore';
import { formatSunsetTime, minutesUntilSunset } from '../utils/sunsetTime';

export default function InfoPanel({ location, weather, scoreResult, loading, error }) {
  const name =
    location?.name ??
    weather?.name ??
    (location ? `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}` : null);

  const sunsetTime = weather
    ? formatSunsetTime(weather.sys?.sunset, weather.timezone)
    : null;

  const mins = weather ? minutesUntilSunset(weather.sys?.sunset) : null;
  const sunsetHint =
    mins == null ? '' :
    mins > 0 ? `in ${mins}m` :
    mins > -120 ? `${Math.abs(mins)}m ago` : '';

  const clouds = weather?.clouds?.all;
  const humidity = weather?.main?.humidity;
  const visibility = weather?.visibility;
  const windSpeed = weather?.wind?.speed;

  return (
    <aside className="info-panel">

      {loading && <p className="info-panel__status">Loading…</p>}
      {error && <p className="info-panel__error" role="alert">{error}</p>}

      {!loading && !error && !weather && (
        <p className="info-panel__status" style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
          Search a city or use your location to see sunset conditions.
        </p>
      )}

      {!loading && !error && weather && (
        <>
          {/* Location */}
          <section className="info-panel__section">
            <h2>Location</h2>
            <p className="info-panel__location">{name ?? '—'}</p>
            {weather.weather?.[0]?.description && (
              <p className="info-panel__meta" style={{ textTransform: 'capitalize' }}>
                {weather.weather[0].description}
              </p>
            )}
          </section>

          {/* Sunset time */}
          <section className="info-panel__section">
            <h2>Sunset</h2>
            <p className="info-panel__sunset-time">{sunsetTime ?? '—'}</p>
            {sunsetHint && (
              <span className="info-panel__hint">{sunsetHint}</span>
            )}
          </section>

          {/* Weather stats grid */}
          <section className="info-panel__section">
            <h2>Conditions</h2>
            <div className="stat-grid">
              <div className="stat-card">
                <p className="stat-card__label">Temp</p>
                <p className="stat-card__value">
                  {Math.round(weather.main?.temp ?? 0)}
                  <span className="stat-card__unit">°C</span>
                </p>
              </div>
              <div className="stat-card">
                <p className="stat-card__label">Humidity</p>
                <p className="stat-card__value">
                  {humidity ?? '—'}
                  <span className="stat-card__unit">%</span>
                </p>
              </div>
              <div className="stat-card">
                <p className="stat-card__label">Clouds</p>
                <p className="stat-card__value">
                  {clouds ?? '—'}
                  <span className="stat-card__unit">%</span>
                </p>
              </div>
              <div className="stat-card">
                <p className="stat-card__label">Wind</p>
                <p className="stat-card__value">
                  {windSpeed != null ? Math.round(windSpeed) : '—'}
                  <span className="stat-card__unit">m/s</span>
                </p>
              </div>
            </div>
          </section>

          {/* Sunset score */}
          {scoreResult && (
            <section className="info-panel__section">
              <h2>Quality Score</h2>
              <SunsetScore
                score={scoreResult.score}
                breakdown={scoreResult.breakdown}
              />
            </section>
          )}

          {/* Description */}
          {scoreResult?.description && (
            <section className="info-panel__section">
              <h2>Outlook</h2>
              <p className="info-panel__description">{scoreResult.description}</p>
            </section>
          )}
        </>
      )}

      <footer className="info-panel__footer">
        <p>🔴 poor · 🟡 average · 🟢 amazing</p>
      </footer>
    </aside>
  );
}
