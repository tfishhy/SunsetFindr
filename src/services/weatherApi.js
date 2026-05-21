import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE = 'https://api.openweathermap.org/data/2.5';
const GEO = 'https://api.openweathermap.org/geo/1.0';

function ensureApiKey() {
  if (!API_KEY || API_KEY === 'your_key_here') {
    throw new Error(
      'Missing OpenWeatherMap API key. Add VITE_OPENWEATHER_API_KEY to your .env file.'
    );
  }
}

const client = axios.create({ timeout: 12000 });

/** User-facing message for failed weather requests. */
export function formatWeatherError(err) {
  const status = err.response?.status;
  const message = err.response?.data?.message;

  if (status === 401) {
    return (
      'OpenWeather rejected your API key. New keys can take up to 2 hours to activate after signup. ' +
      'Confirm your account email, create a fresh key at openweathermap.org/api_keys, paste it into .env as VITE_OPENWEATHER_API_KEY, then restart the dev server (npm run dev).'
    );
  }

  return message ?? err.message ?? 'Failed to load weather';
}

/**
 * Current weather by city name.
 */
export async function fetchWeatherByCity(cityQuery) {
  ensureApiKey();
  const { data } = await client.get(`${BASE}/weather`, {
    params: {
      q: cityQuery.trim(),
      appid: API_KEY,
      units: 'metric',
    },
  });
  return data;
}

/**
 * Current weather by coordinates.
 */
export async function fetchWeatherByCoords(lat, lon) {
  ensureApiKey();
  const { data } = await client.get(`${BASE}/weather`, {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units: 'metric',
    },
  });
  return data;
}

/**
 * Geocode a place name to coordinates (for search suggestions).
 */
export async function geocodeCity(query, limit = 5) {
  ensureApiKey();
  const { data } = await client.get(`${GEO}/direct`, {
    params: {
      q: query.trim(),
      limit,
      appid: API_KEY,
    },
  });
  return data;
}
