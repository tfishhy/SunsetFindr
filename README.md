# Sunset Tracker 🌅

Sunset Tracker predicts and visualizes sunset quality based on your location. It uses OpenWeatherMap current weather data to score conditions (0–100) and displays results on an interactive Leaflet map.

## Features

- **Location search** — type a city name or use GPS
- **Sunset quality score** — clouds, humidity, visibility, and proximity to sunset
- **Interactive map** — color-coded markers (🔴 poor · 🟡 average · 🟢 amazing)
- **Info panel** — location, sunset time, score breakdown, and a short forecast blurb
- **Grid exploration** — pan/zoom the map to compare a sparse grid of nearby spots

## Tech stack

- React (Vite)
- Leaflet + React-Leaflet
- OpenWeatherMap API
- Axios
- Plain CSS

## Setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **API key**

   - Create a free key at [OpenWeatherMap](https://openweathermap.org/api).
   - Copy `.env.example` to `.env`:

     ```bash
     cp .env.example .env
     ```

   - Set your key:

     ```
     VITE_OPENWEATHER_API_KEY=your_actual_key_here
     ```

   New keys can take a few minutes to activate.

3. **Run locally**

   ```bash
   npm run dev
   ```

   Open the URL shown in the terminal (usually `http://localhost:5173`).

4. **Production build**

   ```bash
   npm run build
   npm run preview
   ```

## Project structure

```
src/
  components/
    Map.jsx          # Leaflet map + grid markers
    SearchBar.jsx    # City search + GPS
    SunsetScore.jsx  # Score ring + breakdown
    InfoPanel.jsx    # Sidebar details
  utils/
    sunsetScore.js   # Scoring formula (tune weights here)
    sunsetTime.js    # Format sys.sunset from API
  services/
    weatherApi.js    # OpenWeatherMap client
  App.jsx
  main.jsx
```

## Scoring

Weights live in `src/utils/sunsetScore.js`:

- **Cloud cover** — best around 20–60% (partial clouds)
- **Humidity** — lower is better
- **Visibility** — higher is better
- **Sunset proximity** — bonus within 30 minutes of `sys.sunset`

Sunset time comes from the weather response (`sys.sunset` Unix timestamp); no extra astronomy library is required.

## Notes

- All API calls are client-side; there is no backend yet.
- Grid mode issues several weather requests when you pan the map; use responsibly on free API tiers.
- Do not commit `.env` — only `.env.example` is tracked.

## License

MIT
