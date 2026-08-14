export function getPasswordStrength(password = '') {
  let score = 0;
  if (!password || password.length === 0) {
    return { score: 0, label: '', colorClass: 'bg-slate-200', textClass: '' };
  }

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  let label = '';
  if (score === 1) label = 'Weak';
  else if (score === 2) label = 'Fair';
  else if (score >= 3) label = 'Strong';

  const colorClass =
    score === 0 ? 'bg-slate-200' : score === 1 ? 'bg-rose-500' : score === 2 ? 'bg-amber-500' : 'bg-emerald-500';
  const textClass = score === 0 ? '' : score === 1 ? 'text-rose-500' : score === 2 ? 'text-amber-500' : 'text-emerald-500';

  return { score, label, colorClass, textClass };
}

export default getPasswordStrength;
