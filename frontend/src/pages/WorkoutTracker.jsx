import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, MapPin, Activity, Flame, Clock, Navigation, AlertCircle, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';

// Helper: Haversine formula to calculate distance between two coordinates in kilometers
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return Math.sqrt(a) * R * 2;
}

export default function WorkoutTracker() {
  const [status, setStatus] = useState('idle'); // idle, tracking, paused, finished
  const [workoutType, setWorkoutType] = useState('running'); // running, cycling, walking
  
  // Metrics
  const [distance, setDistance] = useState(0); // in kilometers
  const [time, setTime] = useState(0); // in seconds
  const [calories, setCalories] = useState(0);
  const [path, setPath] = useState([]);
  
  // GPS Status
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // Refs for intervals and watch ID
  const timerRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastPosRef = useRef(null);

  // Format time (HH:MM:SS)
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate Average Pace (min/km)
  const getPace = () => {
    if (distance === 0 || time === 0) return '0:00';
    const paceSeconds = time / distance;
    const m = Math.floor(paceSeconds / 60);
    const s = Math.floor(paceSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Handle new GPS position
  const handlePositionUpdate = useCallback((pos) => {
    const { latitude, longitude, accuracy } = pos.coords;
    
    // Ignore highly inaccurate readings (e.g., > 25 meters off)
    if (accuracy > 25) return;

    const newPos = { lat: latitude, lon: longitude, timestamp: pos.timestamp };

    setPath(prevPath => {
      // If we are tracking, calculate distance and calories
      if (status === 'tracking' && prevPath.length > 0) {
        const lastPos = prevPath[prevPath.length - 1];
        const distDelta = haversineDistance(lastPos.lat, lastPos.lon, newPos.lat, newPos.lon);
        
        // Ignore micro-movements (GPS jitter) - must move at least 2 meters
        if (distDelta > 0.002) {
          setDistance(prev => {
            const newDist = prev + distDelta;
            // Simple MET calorie calculation
            const met = workoutType === 'running' ? 9.8 : workoutType === 'cycling' ? 7.5 : 3.8;
            const hours = time / 3600;
            const currentCals = met * 70 * hours; 
            setCalories(Math.max(currentCals, newDist * 60)); 
            return newDist;
          });
          return [...prevPath, newPos];
        }
        return prevPath;
      }
      
      // Just record initial position if idle
      return prevPath.length === 0 ? [newPos] : prevPath;
    });

    lastPosRef.current = newPos;
    setGpsActive(true);
    setGpsError('');
  }, [status, workoutType, time]);

  const handlePositionError = useCallback((err) => {
    setGpsActive(false);
    setGpsError(err.message || 'Failed to get GPS signal. Make sure location is enabled.');
  }, []);

  // Initialize GPS Watch
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your device.');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handlePositionError,
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [handlePositionUpdate, handlePositionError]);

  // Handle Stopwatch
  useEffect(() => {
    if (status === 'tracking') {
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  const startWorkout = () => setStatus('tracking');
  const pauseWorkout = () => setStatus('paused');
  const stopWorkout = () => setStatus('finished');
  const resetWorkout = () => {
    setStatus('idle');
    setDistance(0);
    setTime(0);
    setCalories(0);
    setPath(lastPosRef.current ? [lastPosRef.current] : []);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50/50 p-4 md:p-8 flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full max-w-4xl mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
              <Navigation className="w-5 h-5 text-brand-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">Live Tracker</h1>
          </div>
          <p className="text-gray-500 font-medium md:ml-12">Track your real-time GPS workout metrics.</p>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-2 flex items-center gap-2">
            <select 
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value)}
              disabled={status !== 'idle'}
              className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
            >
              <option value="running">Running</option>
              <option value="cycling">Cycling</option>
              <option value="walking">Walking</option>
            </select>
          </div>
          
          <div className={`border rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-bold shadow-sm transition-colors ${
            gpsActive ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full ${gpsActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            {gpsActive ? 'GPS Active' : 'No Signal'}
          </div>
        </div>
      </div>

      {gpsError && (
        <div className="w-full max-w-4xl mb-8 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-800 shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-semibold text-sm">{gpsError}</p>
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Large Time Display (Spans 2 columns on large screens) */}
        <motion.div 
          className="lg:col-span-2 bg-slate-900 text-white rounded-3xl p-8 shadow-xl shadow-slate-900/20 relative overflow-hidden flex flex-col justify-between min-h-[220px]"
          animate={{ scale: status === 'tracking' ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 2, repeat: status === 'tracking' ? Infinity : 0 }}
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/20 blur-3xl rounded-full" />
          
          <div className="flex items-center gap-2 text-slate-400 font-bold tracking-widest text-xs uppercase mb-2 relative z-10">
            <Clock className="w-4 h-4 text-brand-primary" /> Active Duration
          </div>
          <div className="text-6xl md:text-7xl font-black tracking-tighter tabular-nums relative z-10">
            {formatTime(time)}
          </div>
        </motion.div>

        {/* Distance Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl shadow-gray-200/50 flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center gap-2 text-gray-500 font-bold tracking-widest text-xs uppercase mb-2">
            <MapPin className="w-4 h-4 text-indigo-500" /> Distance
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-gray-900 tracking-tighter tabular-nums">{distance.toFixed(2)}</span>
            <span className="text-lg font-bold text-gray-400">km</span>
          </div>
        </div>

        {/* Pace Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl shadow-gray-200/50 flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center gap-2 text-gray-500 font-bold tracking-widest text-xs uppercase mb-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Avg Pace
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-gray-900 tracking-tighter tabular-nums">{getPace()}</span>
            <span className="text-lg font-bold text-gray-400">/km</span>
          </div>
        </div>

        {/* Calories (Bottom Left) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-orange-50 to-rose-50 border border-orange-100 rounded-3xl p-6 shadow-xl shadow-orange-100 flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center gap-2 text-orange-600 font-bold tracking-widest text-xs uppercase mb-2">
            <Flame className="w-4 h-4" /> Est. Calories Burned
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-orange-600 tracking-tighter tabular-nums">{Math.floor(calories)}</span>
            <span className="text-lg font-bold text-orange-400">kcal</span>
          </div>
        </div>

        {/* Radar Graphic Placeholder */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-xl shadow-gray-200/50 flex items-center justify-center relative overflow-hidden min-h-[220px]">
          <div className="absolute inset-0 grid place-items-center opacity-10 pointer-events-none">
            <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          </div>
          <div className="relative z-10 text-center space-y-3">
             <div className="w-16 h-16 mx-auto bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary relative">
                {status === 'tracking' && (
                  <>
                    <motion.div className="absolute inset-0 rounded-full border-2 border-brand-primary"
                       animate={{ scale: [1, 2], opacity: [1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
                    <motion.div className="absolute inset-0 rounded-full border-2 border-brand-primary"
                       animate={{ scale: [1, 2.5], opacity: [1, 0] }} transition={{ duration: 1.5, delay: 0.75, repeat: Infinity }} />
                  </>
                )}
                <MapPin className="w-8 h-8 relative z-10" />
             </div>
             <div>
                <p className="font-bold text-gray-800">{path.length > 0 ? `${path.length} GPS Points Recorded` : 'Awaiting Movement'}</p>
                <p className="text-xs text-gray-400">Map view is minimal in this version.</p>
             </div>
          </div>
        </div>

      </div>

      {/* Controls */}
      <div className="w-full max-w-4xl flex items-center justify-center gap-6">
        
        {status === 'idle' && (
          <button 
            onClick={startWorkout}
            disabled={!gpsActive && !gpsError}
            className="bg-brand-primary text-white text-xl font-black tracking-widest uppercase px-14 py-5 rounded-full shadow-2xl shadow-brand-primary/40 hover:bg-brand-primary/90 transition-all flex items-center gap-3 disabled:opacity-50 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-white" /> Start
          </button>
        )}

        {status === 'tracking' && (
          <button 
            onClick={pauseWorkout}
            className="bg-amber-500 text-white text-xl font-black tracking-widest uppercase px-14 py-5 rounded-full shadow-2xl shadow-amber-500/40 hover:bg-amber-600 transition-all flex items-center gap-3 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Pause className="w-6 h-6 fill-white" /> Pause
          </button>
        )}

        {status === 'paused' && (
          <>
            <button 
              onClick={startWorkout}
              className="bg-emerald-500 text-white text-xl font-black tracking-widest uppercase px-10 py-5 rounded-full shadow-2xl shadow-emerald-500/40 hover:bg-emerald-600 transition-all flex items-center gap-3 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-6 h-6 fill-white" /> Resume
            </button>
            <button 
              onClick={stopWorkout}
              className="bg-slate-900 text-white text-xl font-black tracking-widest uppercase px-10 py-5 rounded-full shadow-2xl shadow-slate-900/40 hover:bg-slate-800 transition-all flex items-center gap-3 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Square className="w-5 h-5 fill-white" /> Finish
            </button>
          </>
        )}

        {status === 'finished' && (
          <div className="text-center w-full max-w-lg bg-white border border-gray-100 shadow-xl rounded-3xl p-8">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 mx-auto rounded-full flex items-center justify-center mb-4">
              <Dumbbell className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Workout Complete!</h2>
            <p className="text-gray-500 mb-8">You burned {Math.floor(calories)} calories over {distance.toFixed(2)}km.</p>
            
            <button 
              onClick={resetWorkout}
              className="w-full bg-brand-primary text-white font-bold tracking-widest uppercase py-4 rounded-xl hover:bg-brand-primary/90 transition-all shadow-xl shadow-brand-primary/20 cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
