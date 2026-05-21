import { useCallback, useState } from 'react';
import Map from './components/Map';
import SearchBar from './components/SearchBar';
import InfoPanel from './components/InfoPanel';
import {
  fetchWeatherByCity,
  fetchWeatherByCoords,
  formatWeatherError,
} from './services/weatherApi';
import { calculateSunsetScore } from './utils/sunsetScore';
import './App.css';

export default function App() {
  const [weather, setWeather] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);
  const [center, setCenter] = useState(null);
  const [locationLabel, setLocationLabel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const applyWeather = useCallback((data, label) => {
    setWeather(data);
    setScoreResult(calculateSunsetScore(data));
    setCenter([data.coord.lat, data.coord.lon]);
    setLocationLabel(
      label ?? `${data.name}${data.sys?.country ? `, ${data.sys.country}` : ''}`
    );
    setError(null);
  }, []);

  const loadCoords = useCallback(
    async (lat, lon, label) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWeatherByCoords(lat, lon);
        applyWeather(data, label);
      } catch (err) {
        setError(formatWeatherError(err));
        setWeather(null);
        setScoreResult(null);
      } finally {
        setLoading(false);
      }
    },
    [applyWeather]
  );

  async function handleSearch(cityQuery) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherByCity(cityQuery);
      applyWeather(data);
    } catch (err) {
      setError(formatWeatherError(err));
      setWeather(null);
      setScoreResult(null);
    } finally {
      setLoading(false);
    }
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        loadCoords(latitude, longitude, 'Your location');
      },
      () => {
        setLoading(false);
        setError('Could not access your location. Check permissions and try again.');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  return (
    <div className="app">
      <header className="app__topbar">
        <div className="app__logo">
          <span className="app__logo-dot" />
        </div>
        <SearchBar
          onSearch={handleSearch}
          onUseLocation={handleUseLocation}
          loading={loading}
          error={error}
        />
      </header>

      <InfoPanel
        location={locationLabel ? { name: locationLabel } : null}
        weather={weather}
        scoreResult={scoreResult}
        loading={loading}
        error={error}
      />

      <main className="app__main">
        <Map
          center={center}
          primaryWeather={weather}
          primaryScore={scoreResult?.score}
          exploreGrid
        />
      </main>
    </div>
  );
}