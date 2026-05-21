/**
 * Sunset quality scoring (0–100).
 * Weights can be tuned here without touching UI code.
 */

const WEIGHTS = {
  clouds: 0.35,
  humidity: 0.2,
  visibility: 0.25,
  proximity: 0.2,
};

/** Partial clouds (20–60%) score highest; clear and overcast are penalized. */
export function scoreCloudCover(cloudPercent) {
  const c = Math.max(0, Math.min(100, cloudPercent ?? 0));

  if (c >= 20 && c <= 60) {
    const distanceFromIdeal = Math.abs(c - 40);
    return 100 - (distanceFromIdeal / 20) * 25;
  }

  if (c < 20) {
    return 45 + (c / 20) * 35;
  }

  const excess = c - 60;
  return Math.max(10, 75 - (excess / 40) * 65);
}

/** Lower humidity is better for vivid sunsets. */
export function scoreHumidity(humidity) {
  const h = Math.max(0, Math.min(100, humidity ?? 50));
  return Math.max(0, 100 - h * 0.9);
}

/** Higher visibility (meters) is better; OWM often caps at 10 km. */
export function scoreVisibility(visibilityMeters) {
  const meters = visibilityMeters ?? 10000;
  const km = meters / 1000;
  return Math.min(100, (km / 10) * 100);
}

/**
 * Bonus when current time is within 30 minutes of sunset.
 * @param {number} sunsetUnix - Unix seconds from OWM sys.sunset
 * @param {number} [nowUnix] - Unix seconds (defaults to now)
 */
export function scoreSunsetProximity(sunsetUnix, nowUnix = Date.now() / 1000) {
  if (!sunsetUnix) return 0;

  const diffMinutes = Math.abs(sunsetUnix - nowUnix) / 60;
  if (diffMinutes > 30) return 0;

  return 100 * (1 - diffMinutes / 30);
}

export function getScoreTier(score) {
  if (score <= 40) return { label: 'Poor', emoji: '🔴', color: '#ef4444' };
  if (score <= 70) return { label: 'Average', emoji: '🟡', color: '#eab308' };
  return { label: 'Amazing', emoji: '🟢', color: '#22c55e' };
}

/**
 * @param {object} weather - OpenWeatherMap current weather payload
 * @returns {{ score: number, breakdown: object, description: string }}
 */
export function calculateSunsetScore(weather) {
  const clouds = weather?.clouds?.all ?? 0;
  const humidity = weather?.main?.humidity ?? 50;
  const visibility = weather?.visibility ?? 10000;
  const sunsetUnix = weather?.sys?.sunset;

  const breakdown = {
    clouds: Math.round(scoreCloudCover(clouds)),
    humidity: Math.round(scoreHumidity(humidity)),
    visibility: Math.round(scoreVisibility(visibility)),
    proximity: Math.round(scoreSunsetProximity(sunsetUnix)),
  };

  const score = Math.round(
    breakdown.clouds * WEIGHTS.clouds +
      breakdown.humidity * WEIGHTS.humidity +
      breakdown.visibility * WEIGHTS.visibility +
      breakdown.proximity * WEIGHTS.proximity
  );

  const clamped = Math.max(0, Math.min(100, score));
  const description = buildDescription(weather, breakdown, clamped);

  return { score: clamped, breakdown, description };
}

function buildDescription(weather, breakdown, score) {
  const clouds = weather?.clouds?.all ?? 0;
  const humidity = weather?.main?.humidity ?? 0;
  const tier = getScoreTier(score);

  let sky;
  if (clouds < 20) sky = 'Mostly clear skies';
  else if (clouds <= 60) sky = 'Partly cloudy skies';
  else sky = 'Heavy cloud cover';

  let moisture;
  if (humidity < 40) moisture = 'low humidity';
  else if (humidity < 65) moisture = 'moderate humidity';
  else moisture = 'high humidity';

  const proximity =
    breakdown.proximity >= 70
      ? ' — sunset is soon'
      : breakdown.proximity >= 40
        ? ' — approaching sunset'
        : '';

  const outlook =
    score >= 71
      ? 'great conditions for vivid colors'
      : score >= 41
        ? 'decent conditions, worth watching'
        : 'conditions may be dull or blocked';

  return `${sky} with ${moisture}${proximity} — ${outlook} (${tier.label})`;
}
