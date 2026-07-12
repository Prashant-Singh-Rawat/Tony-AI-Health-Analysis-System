const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Upload a PDF report for AI analysis.
 * @param {File} file
 * @param {number|string} userId
 * @param {AbortSignal} [signal]
 * @returns {Promise<Object>} analysis result
 */
export const uploadReport = async (file, userId, signal) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/users/${userId}/upload_report`, {
    method: 'POST',
    body: formData,
    signal,
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.detail || 'Failed to analyze report.');
  }

  return response.json();
};
