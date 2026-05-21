import { useState } from 'react';

export default function SearchBar({
  onSearch,
  onUseLocation,
  loading,
  error,
}) {
  const [query, setQuery] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    onSearch(trimmed);
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-bar__row">
        <input
          type="search"
          className="search-bar__input"
          placeholder="Search city (e.g. San Francisco, US)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          aria-label="City search"
        />
        <button type="submit" className="search-bar__btn" disabled={loading || !query.trim()}>
          Search
        </button>
        <button
          type="button"
          className="search-bar__btn search-bar__btn--secondary"
          onClick={onUseLocation}
          disabled={loading}
          title="Use current GPS location"
        >
          My location
        </button>
      </div>
      {error && <p className="search-bar__error" role="alert">{error}</p>}
    </form>
  );
}
