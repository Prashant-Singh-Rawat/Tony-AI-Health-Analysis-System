/**
 * useMedicineSearch — debounced medicine search with autocomplete
 * Queries the provider registry; falls back to mock data.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { searchAllProviders } from '../services/pharmacy';

export function useMedicineSearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  const search = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setSuggestions([]);
      setResults([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await searchAllProviders(q.trim());
      setSuggestions(data.slice(0, 6));
      setResults(data);
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setResults([]);
    setError('');
  }, []);

  return { query, setQuery, suggestions, results, loading, error, clearSearch };
}
