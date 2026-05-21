import { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { fetchWeatherByCoords } from '../services/weatherApi';
import {
  calculateSunsetScore,
  getScoreTier,
} from '../utils/sunsetScore';

mapboxgl.accessToken =
  import.meta.env.VITE_MAPBOX_TOKEN;

const HEATMAP_SOURCE = 'sunset-heat';
const HEATMAP_LAYER = 'sunset-heatmap';

export default function Map({
  center,
  zoom = 8,
  primaryWeather,
  primaryScore,
  exploreGrid = true,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const timerRef = useRef(null);

  const lastCenterRef = useRef(null);

  const [mapReady, setMapReady] =
    useState(false);

  /* ─────────────────────────────
     LOAD HEATMAP
  ───────────────────────────── */

  const loadHeatmap = useCallback(async () => {
  const map = mapRef.current;

  if (!map || !mapReady || !exploreGrid)
    return;

  const bounds = map.getBounds();

  const south = bounds.getSouth();
  const north = bounds.getNorth();
  const west = bounds.getWest();
  const east = bounds.getEast();

  // LOWER GRID SIZE
  const GRID_SIZE = 10;

  const points = [];

  const latStep =
    (north - south) / GRID_SIZE;

  const lonStep =
    (east - west) / GRID_SIZE;

  // CLEAN STABLE GRID
  for (let y = 0; y <= GRID_SIZE; y++) {
    for (let x = 0; x <= GRID_SIZE; x++) {
      points.push({
        lat: south + y * latStep,
        lon: west + x * lonStep,
      });
    }
  }

  // FETCH WEATHER
  const results = await Promise.all(
    points.map(async (point) => {
      try {
        const weather =
          await fetchWeatherByCoords(
            point.lat,
            point.lon
          );

        const { score } =
          calculateSunsetScore(weather);

        return {
          type: 'Feature',

          geometry: {
            type: 'Point',

            coordinates: [
              point.lon,
              point.lat,
            ],
          },

          properties: {
            score,
          },
        };
      } catch {
        return null;
      }
    })
  );

  const source = map.getSource(
    HEATMAP_SOURCE
  );

  if (!source) return;

  source.setData({
    type: 'FeatureCollection',

    features: results.filter(Boolean),
  });
}, [mapReady, exploreGrid]);

  /* ─────────────────────────────
     MAP INIT
  ───────────────────────────── */

  useEffect(() => {
    if (mapRef.current) return;

    if (!containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,

      style:
        'mapbox://styles/tfishy/cmpesafry000601s86yt44f8o',

      center: center
        ? [center[1], center[0]]
        : [-79.3832, 43.6532],

      zoom,

      attributionControl: false,
    });

    mapRef.current = map;

    map.on('load', () => {
      map.setFog({
        color: 'rgb(15,15,25)',

        'high-color':
          'rgb(36,92,223)',

        'horizon-blend': 0.02,

        'space-color':
          'rgb(11,11,25)',

        'star-intensity': 0.15,
      });

      /* ─────────────────────────────
         SOURCE
      ───────────────────────────── */

      map.addSource(HEATMAP_SOURCE, {
        type: 'geojson',

        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      /* ─────────────────────────────
         HEATMAP
      ───────────────────────────── */

      map.addLayer({
        id: HEATMAP_LAYER,

        type: 'heatmap',

        source: HEATMAP_SOURCE,

        maxzoom: 15,

        paint: {
  'heatmap-weight': [
    'interpolate',
    ['linear'],
    ['get', 'score'],

    0, 0,
    30, 0.25,
    50, 0.5,
    70, 0.8,
    100, 1
  ],

  'heatmap-intensity': [
    'interpolate',
    ['linear'],
    ['zoom'],

    0, 1,
    6, 1.6,
    10, 2.2,
    14, 3
  ],

  'heatmap-radius': [
    'interpolate',
    ['linear'],
    ['zoom'],

    0, 90,
    6, 140,
    10, 220,
    14, 320
  ],

  'heatmap-opacity': 0.5,

  'heatmap-color': [
    'interpolate',
    ['linear'],
    ['heatmap-density'],

    0,
    'rgba(0,0,0,0)',

    0.2,
    'rgba(65,105,225,0.1)',

    0.4,
    'rgba(0,191,255,0.2)',

    0.6,
    'rgba(0,255,140,0.35)',

    0.75,
    'rgba(255,255,0,0.55)',

    0.9,
    'rgba(255,140,0,0.75)',

    1,
    'rgba(255,0,0,0.9)',
  ],
},
      });

      setMapReady(true);

      setTimeout(() => {
        loadHeatmap();
      }, 800);
    });

    return () => {
      clearTimeout(timerRef.current);

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  /* ─────────────────────────────
     FLY TO LOCATION
  ───────────────────────────── */

  useEffect(() => {
    if (!mapRef.current || !center)
      return;

    mapRef.current.flyTo({
      center: [center[1], center[0]],

      zoom: 9,

      duration: 2000,
    });
  }, [center]);

  /* ─────────────────────────────
     RELOAD ONLY AFTER BIG MOVE
  ───────────────────────────── */

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapReady) return;

    const update = () => {
      const center = map.getCenter();

      if (!lastCenterRef.current) {
        lastCenterRef.current = center;

        loadHeatmap();
        return;
      }

      const dx = Math.abs(
        center.lng -
          lastCenterRef.current.lng
      );

      const dy = Math.abs(
        center.lat -
          lastCenterRef.current.lat
      );

      // ignore tiny movement
      if (dx < 0.15 && dy < 0.15) {
        return;
      }

      lastCenterRef.current = center;

      clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        loadHeatmap();
      }, 1200);
    };

    update();

    map.on('moveend', update);

    return () => {
      map.off('moveend', update);

      clearTimeout(timerRef.current);
    };
  }, [mapReady, loadHeatmap]);

  /* ─────────────────────────────
     MAIN LOCATION MARKER
  ───────────────────────────── */

  useEffect(() => {
    if (
      !mapRef.current ||
      !primaryWeather?.coord
    )
      return;

    if (markerRef.current) {
      markerRef.current.remove();
    }

    const tier = getScoreTier(
      primaryScore ?? 0
    );

    const el =
      document.createElement('div');

    el.style.cssText = `
      width: 22px;
      height: 22px;
      border-radius: 999px;
      background: ${tier.color};
      border: 3px solid white;

      box-shadow:
        0 0 20px ${tier.color},
        0 0 40px ${tier.color};

      cursor: pointer;
    `;

    markerRef.current =
      new mapboxgl.Marker({
        element: el,
      })
        .setLngLat([
          primaryWeather.coord.lon,
          primaryWeather.coord.lat,
        ])
        .addTo(mapRef.current);
  }, [primaryWeather, primaryScore]);

  /* ─────────────────────────────
     RENDER
  ───────────────────────────── */

  return (
    <div
      className="map"
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}