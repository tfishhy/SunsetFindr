/**
 * Format sunset time from OpenWeatherMap sys.sunset (Unix seconds, UTC).
 */

export function formatSunsetTime(sunsetUnix, timezoneOffsetSeconds = 0) {
  if (!sunsetUnix) return '—';

  const localMs = (sunsetUnix + timezoneOffsetSeconds) * 1000;
  return new Date(localMs).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function minutesUntilSunset(sunsetUnix, nowUnix = Date.now() / 1000) {
  if (!sunsetUnix) return null;
  return Math.round((sunsetUnix - nowUnix) / 60);
}

export function isWithinSunsetWindow(sunsetUnix, windowMinutes = 30) {
  if (!sunsetUnix) return false;
  const diff = Math.abs(sunsetUnix - Date.now() / 1000) / 60;
  return diff <= windowMinutes;
}
