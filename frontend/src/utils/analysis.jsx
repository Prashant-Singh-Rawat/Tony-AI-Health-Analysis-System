import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

/**
 * Get user from localStorage.
 * @returns {Object|null}
 */
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('tony_health_user'));
  } catch {
    return null;
  }
};

/**
 * Returns Tailwind text color class based on risk score.
 * @param {number} score
 * @returns {string}
 */
export const getRiskColor = (score) => {
  if (score >= 70) return 'text-red-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-green-600';
};

/**
 * Returns Tailwind background/border classes based on risk score.
 * @param {number} score
 * @returns {string}
 */
export const getRiskBg = (score) => {
  if (score >= 70) return 'bg-red-50 border-red-200';
  if (score >= 40) return 'bg-yellow-50 border-yellow-200';
  return 'bg-green-50 border-green-200';
};

/**
 * Returns a Lucide icon element based on health status.
 * @param {string} status
 * @param {number} [size=5]
 * @returns {JSX.Element}
 */
export const getStatusIcon = (status, size = 5) => {
  const cls = `w-${size} h-${size}`;
  if (status === 'Improving') return <TrendingUp className={`${cls} text-green-500`} />;
  if (status === 'Worsening') return <TrendingDown className={`${cls} text-red-500`} />;
  return <Activity className={`${cls} text-slate-500`} />;
};
