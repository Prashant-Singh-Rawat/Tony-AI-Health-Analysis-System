import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Reset modal state when opened/closed
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setLoading(false);
      setIsLogin(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleSuccess = (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      if (!credentialResponse?.credential) {
        throw new Error('No credential received from Google.');
      }
      const decoded = jwtDecode(credentialResponse.credential);
      const user = {
        id: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        token: credentialResponse.credential,
      };
      localStorage.setItem('tony_health_user', JSON.stringify(user));
      setLoading(false);
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
      setError('Google Sign-In failed. Please try again.');
      console.error('Error decoding Google token:', err);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In was unsuccessful. Please try again or use password login.');
    setLoading(false);
  };

  const handleSimulatedLogin = (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = {
        id: 'mock-google-id-123',
        name: 'Prashant Singh',
        email: 'rawatnaksh67@gmail.com',
        token: 'mock_jwt_token_for_local_dev',
      };
      localStorage.setItem('tony_health_user', JSON.stringify(user));
      setLoading(false);
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
      setError('Login failed. Please check your credentials and try again.');
      console.error('Login error:', err);
    }
  };

  const handleClose = () => {
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">

        <button
          onClick={handleClose}
          className="absolute right-6 top-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8 mt-2">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
            Join Tony Health
          </h2>
          <p className="text-slate-500">
            Create an account to track your health metrics
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            shape="pill"
            size="large"
            theme="outline"
            text="continue_with"
            width="100%"
          />
        </div>

        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative px-4 bg-white text-xs font-bold text-gray-400 tracking-wider uppercase">
            Or use password credentials
          </div>
        </div>

        <form onSubmit={handleSimulatedLogin} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              defaultValue="rawatnaksh67@gmail.com"
              className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
              <input
                type="tel"
                defaultValue="+91 88666 71624"
                className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-slate-700 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>

          {!isLogin && (
            <label className="flex items-start gap-3 mt-4 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-1 rounded text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-slate-600">Send updates & features announcements to my phone or email.</span>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl transition-colors mt-6 shadow-lg shadow-blue-600/30"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Register Account'}
          </button>
        </form>

        <div className="text-center mt-8 text-sm text-slate-500">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-blue-600 font-bold hover:underline"
          >
            {isLogin ? 'Register Instead' : 'Sign In Instead'}
          </button>
        </div>

      </div>
    </div>
  );
}