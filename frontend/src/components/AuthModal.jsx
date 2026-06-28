import { useState, useEffect } from 'react';
import { X, AlertCircle, Lock, Mail, User, Phone, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const navigate = useNavigate();

  // Reset modal state when opened/closed
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setLoading(false);
      setIsLogin(false);
      setForm({ name: '', email: '', phone: '', password: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Google OAuth ────────────────────────────────────────────────
  const handleGoogleSuccess = (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      if (!credentialResponse?.credential) {
        throw new Error('No credential received from Google.');
      }
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      axios.post(`${apiBase}/auth/google`, { token: credentialResponse.credential })
        .then(res => {
          const user = {
            id: res.data.id,
            name: res.data.name,
            email: res.data.email,
            picture: jwtDecode(credentialResponse.credential).picture,
            token: credentialResponse.credential,
          };
          localStorage.setItem('tony_health_user', JSON.stringify(user));
          setLoading(false);
          onClose();
          navigate('/dashboard');
        })
        .catch(err => {
          setLoading(false);
          const errMsg = err.response?.data?.detail || 'Google authentication failed at database level.';
          setError(errMsg);
          console.error('Google backend auth error:', err);
        });
    } catch (err) {
      setLoading(false);
      setError('Google Sign-In failed. Please try again.');
      console.error('Error decoding Google token:', err);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In was unsuccessful. Please try again.');
    setLoading(false);
  };

  // ── Password Login / Register ───────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!form.email.trim() || !form.password.trim()) {
      setError('Email and password are required.');
      return;
    }
    if (!form.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!isLogin && !form.name.trim()) {
      setError('Full name is required for registration.');
      return;
    }

    setLoading(true);

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const endpoint = isLogin ? `${apiBase}/auth/login` : `${apiBase}/auth/register`;
    const payload = isLogin 
      ? { email: form.email, password: form.password } 
      : { email: form.email, name: form.name, password: form.password };

    axios.post(endpoint, payload)
      .then(res => {
        const user = {
          id: res.data.id,
          name: res.data.name,
          email: res.data.email,
          picture: null,
          token: `local_token_${res.data.id}`,
        };
        localStorage.setItem('tony_health_user', JSON.stringify(user));
        setLoading(false);
        onClose();
        navigate('/dashboard');
      })
      .catch(err => {
        setLoading(false);
        const errMsg = err.response?.data?.detail || 'Authentication failed. Please check details and try again.';
        setError(errMsg);
        console.error('Auth error:', err);
      });
  };

  const handleClose = () => {
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl">

        <button
          onClick={handleClose}
          className="absolute right-6 top-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8 mt-2">
          <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-200">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
            {isLogin ? 'Welcome Back' : 'Join Tony Health'}
          </h2>
          <p className="text-slate-500 text-sm">
            {isLogin ? 'Sign in to access your health dashboard' : 'Create an account to track your health metrics'}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-5 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-In */}
        <div className="flex justify-center mb-5">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            shape="pill"
            size="large"
            theme="outline"
            text={isLogin ? 'signin_with' : 'continue_with'}
            width="320"
          />
        </div>

        <div className="relative flex items-center justify-center mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative px-4 bg-white text-xs font-bold text-gray-400 tracking-wider uppercase">
            Or continue with email
          </div>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
              required
            />
          </div>

          {!isLogin && (
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                placeholder="Phone Number (optional)"
                value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
              />
            </div>
          )}

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (min. 6 characters)"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all mt-2 shadow-lg shadow-red-200"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-slate-500">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); setForm({ name: '', email: '', phone: '', password: '' }); }}
            className="text-red-600 font-bold hover:underline"
          >
            {isLogin ? 'Register Instead' : 'Sign In Instead'}
          </button>
        </div>

      </div>
    </div>
  );
}