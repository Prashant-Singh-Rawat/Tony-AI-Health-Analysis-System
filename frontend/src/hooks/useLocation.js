/**
 * useLocation — HTML5 Geolocation hook with localStorage persistence
 * Manages GPS permission flow and reverse geocoding fallback.
 */
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tonyhealth-location';

function reverseGeocode(lat, lon) {
  return fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
  )
    .then((r) => r.json())
    .then((data) => {
      const a = data.address || {};
      const parts = [
        a.road || a.suburb,
        a.city || a.town || a.village || a.county,
        a.state,
      ].filter(Boolean);
      return parts.join(', ') || data.display_name || 'Unknown location';
    })
    .catch(() => `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
}

export function useLocation() {
  const [status, setStatus] = useState('idle'); // idle | requesting | granted | denied
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  // Restore persisted location on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.coords && parsed.address) {
          setCoords(parsed.coords);
          setAddress(parsed.address);
          setStatus('granted');
        }
      }
    } catch (_) {
      // ignore parse errors
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setStatus('denied');
      return;
    }
    setStatus('requesting');
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const newCoords = { lat: latitude, lon: longitude, accuracy };
        setCoords(newCoords);
        setStatus('granted');

        const resolvedAddress = await reverseGeocode(latitude, longitude);
        setAddress(resolvedAddress);

        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ coords: newCoords, address: resolvedAddress })
          );
        } catch (_) {}
      },
      (err) => {
        setStatus('denied');
        setError(
          err.code === 1
            ? 'Location access denied. You can enter your address manually.'
            : 'Unable to retrieve location. Please try again.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setCoords(null);
    setAddress('');
    setStatus('idle');
    setError('');
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const setManualAddress = useCallback((addr) => {
    setAddress(addr);
    setStatus('granted');
  }, []);

  return { status, coords, address, error, requestLocation, clearLocation, setManualAddress };
}
