import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Shield, Brain, Activity, Heart, User, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', agreed: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    let score = 0;
    const pass = formData.password;
    if (pass.length > 7) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    setPasswordStrength(pass.length === 0 ? 0 : score);
  }, [formData.password]);

  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-slate-200';
    if (passwordStrength === 1) return 'bg-rose-500';
    if (passwordStrength === 2) return 'bg-amber-500';
    if (passwordStrength >= 3) return 'bg-emerald-500';
    return 'bg-emerald-500';
  };
  
  const getStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength === 1) return 'Weak password';
    if (passwordStrength === 2) return 'Fair password';
    if (passwordStrength >= 3) return 'Strong password';
    return '';
  };

  const getStrengthTextColor = () => {
    if (passwordStrength === 1) return 'text-rose-500';
    if (passwordStrength === 2) return 'text-amber-500';
    if (passwordStrength >= 3) return 'text-emerald-500';
    return '';
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && !formData.agreed) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let userData;
      if (isLogin) {
        userData = await apiService.login(formData.email, formData.password);
      } else {
        if (!formData.name) throw new Error('Name is required for registration');
        userData = await apiService.register(formData.name, formData.email, formData.password);
      }
      login(userData);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.friendlyMessage || err.response?.data?.detail || err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* --- LEFT PANEL (BRAND) --- */}
      <div className="hidden lg:flex flex-col w-[45%] bg-[#0B0F19] text-white p-12 relative overflow-hidden justify-between border-r border-indigo-900/30 shadow-2xl">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Heart className="w-5 h-5 text-white fill-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Tony Health</h1>
            <p className="text-[10px] text-indigo-300 font-semibold tracking-wider uppercase">AI Health Analysis System</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-md mt-16 flex-1">
          <h2 className="text-5xl font-black leading-tight tracking-tight mb-4">
            Your Health.<br/>
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Priority.</span>
          </h2>
          <p className="text-slate-400 text-lg mb-12">
            AI-powered insights. Secure storage. Personalized for you.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-900/40 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">100% Private & Secure</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Your data is encrypted and completely confidential.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-900/40 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">AI-Powered Insights</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Advanced AI analyzes your reports for accurate health insights.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900/40 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Track & Improve</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Monitor your health trends and make better decisions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating 3D Shield */}
        <div className="absolute bottom-20 right-0 w-80 h-80 pointer-events-none opacity-80 mix-blend-screen">
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute w-64 h-64 border border-indigo-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute w-48 h-48 border border-purple-500/40 rounded-full animate-[spin_7s_linear_infinite_reverse]"></div>
                <div className="absolute w-32 h-32 bg-indigo-500/20 rounded-full blur-xl"></div>
                <Shield className="w-32 h-32 text-indigo-400 filter drop-shadow-[0_0_15px_rgba(99,102,241,0.8)]" strokeWidth={1} />
                <Heart className="absolute w-12 h-12 text-blue-300 fill-blue-300 filter drop-shadow-[0_0_10px_rgba(147,197,253,0.8)] animate-pulse" />
            </div>
        </div>

        {/* Footer Note */}
        <div className="relative z-10 mt-12">
          <div className="inline-flex items-center gap-3 px-5 py-4 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/50">
            <Lock className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm font-bold text-slate-200">Your health data is safe with us.</p>
              <p className="text-xs text-slate-400">We never share your information with anyone.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT PANEL (FORM) --- */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative">
        <div className="absolute top-8 right-8 hidden sm:block">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm">
                <span>🌐</span> English
            </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[480px] bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 border border-slate-100"
        >
          {/* Form Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p className="text-sm text-slate-500">
              {isLogin ? 'Welcome back! Please enter your details.' : 'Join Tony Health and take control of your health journey'}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start text-left">
              <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 mr-3 shrink-0" />
              <p className="text-sm text-rose-600 font-medium leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    name="name"
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm shadow-sm"
                    placeholder="Tony Stark"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm shadow-sm"
                  placeholder="name@domain.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm shadow-sm"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              
              {!isLogin && formData.password.length > 0 && (
                <div className="mt-3">
                  <div className="flex gap-1.5 h-1.5 mb-1.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div 
                        key={level} 
                        className={`flex-1 rounded-full transition-colors duration-300 ${passwordStrength >= level ? getStrengthColor() : 'bg-slate-100'}`}
                      />
                    ))}
                  </div>
                  <p className={`text-[11px] font-bold ${getStrengthTextColor()}`}>
                    {getStrengthText()}
                  </p>
                </div>
              )}
            </div>

            {!isLogin && (
              <div className="flex items-start mt-2">
                <div className="flex items-center h-5">
                  <input
                    id="agreed"
                    name="agreed"
                    type="checkbox"
                    checked={formData.agreed}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
                <label htmlFor="agreed" className="ml-2 text-[12px] font-medium text-slate-600">
                  I agree to the <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-[0_4px_14px_0_rgb(99,102,241,0.39)] text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {isLogin ? 'Sign in' : 'Create account'} <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-400 font-medium">
                  or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-4 w-4 mr-2" />
                Continue with Google
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-.84 1.5.05 2.78.69 3.52 1.76-2.79 1.63-2.31 5.35.53 6.46-.73 2-1.68 3.8-2.63 4.79zM12.03 7.25C11.97 4.19 14.54 1.7 17.51 1.5c.2 3.2-2.73 5.76-5.48 5.75z"/>
                </svg>
                Continue with Apple
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ name: '', email: '', password: '', agreed: false });
              }}
              className="text-indigo-600 hover:text-indigo-500 font-bold hover:underline"
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
