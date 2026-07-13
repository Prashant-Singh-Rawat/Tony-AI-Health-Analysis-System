import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../services/api';

export function useMedicineRecommendation(apiBase = API_BASE_URL) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    if (!user) {
      setRecommendations([]);
      setHasData(false);
      setMessage('No recommendations available. Please sign in or register to view personalized medicine recommendations.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${apiBase}/api/medicines/recommendations`, {
        headers,
        timeout: 60000,
      });
      setRecommendations(res.data.recommendations || []);
      setHasData(res.data.has_data);
      setMessage(res.data.message);
    } catch (err) {
      setError(err.message || 'Failed to fetch recommendations.');
      setRecommendations([]);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  }, [user, apiBase]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return { recommendations, loading, hasData, message, error, refresh: fetchRecommendations };
}
