import { useState, useRef  } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UploadCloud, File, Loader2, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Activity,RotateCcw  } from 'lucide-react';

export default function Analysis() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem('tony_health_user'));
    } catch {
      return null;
    }
  };

  const getRiskColor = (score) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskBg = (score) => {
    if (score >= 70) return 'bg-red-50 border-red-200';
    if (score >= 40) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getStatusIcon = (status) => {
    if (status === 'Improving') return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (status === 'Worsening') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Activity className="w-5 h-5 text-slate-500" />;
  };

const hasFormData = () => Boolean(file || result || error || dragError);

  const handleClearForm = () => {
    if (hasFormData()) {
      const confirmed = window.confirm('Are you sure you want to clear the form? Any uploaded file and results will be lost.');
      if (!confirmed) return;
    }

    setFile(null);
    setError('');
    setResult(null);
    setLoading(false);
    setDragError('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    // Client-side file size validation (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 10 MB limit. Please upload a smaller file.');
      return;
    }

    setError('');
    setDragError('');
    setResult(null);
    setLoading(true);

    const user = getUser();
    if (!user) {
      setError('Please log in to analyze your report.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 2 min timeout

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/users/${user.id}/upload_report`,
        {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to analyze report.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">

        <div className="bg-white rounded-2xl p-12 shadow-xl border border-gray-100 text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Upload Medical Report</h1>
          <p className="text-slate-600 mb-8">
            Upload your latest PDF report. Our Gemini AI will dynamically extract parameters,
            analyze them against standard reference ranges, and generate personalized health suggestions.
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-8">
            <div
              className={`border-2 border-dashed rounded-2xl p-12 transition-all duration-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer relative ${isDragging ? 'border-brand bg-brand-light shadow-md scale-[1.02]' : 'border-gray-300 hover:border-brand/50 shadow-sm scale-100'}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
                setDragError('');
                const droppedFile = e.dataTransfer.files[0];
                if (!droppedFile) return;
                if (droppedFile.type !== 'application/pdf') {
                  setDragError('Only PDF files are accepted.');
                  return;
                }
                setFile(droppedFile);
                setError('');
                setResult(null);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                hidden
                onChange={(e) => { setFile(e.target.files[0]); setError(''); setResult(null); setDragError(''); }}
              />
              {file ? (
                <div className="flex flex-col items-center">
                  <File className="w-12 h-12 text-brand mb-3" />
                  <span className="font-semibold text-slate-700">{file.name}</span>
                  <span className="text-sm text-gray-500 mt-1">Click to change file</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud className="w-12 h-12 text-gray-400 mb-3" />
                  <span className="font-semibold text-slate-700">Drag & Drop your PDF here</span>
                  <span className="text-sm text-gray-500 mt-1">or click to browse</span>
                </div>
              )}
              {dragError && (
                <p className="text-sm text-red-600 mt-3" role="alert">{dragError}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Link to="/dashboard" className="text-gray-500 font-semibold hover:text-brand">Cancel</Link>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClearForm}
                  disabled={loading || !hasFormData()}
                  className={`flex items-center gap-2 border border-gray-300 text-gray-600 px-6 py-3 rounded-full font-bold transition ${(loading || !hasFormData()) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 hover:text-gray-800'}`}
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={!file || loading}
                  className={`flex items-center gap-2 bg-brand text-white px-8 py-3 rounded-full font-bold shadow-lg transition ${(!file || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-dark'}`}
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {loading ? 'Analyzing with AI...' : 'Analyze Report'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {result && (
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-bold text-slate-800">Analysis Complete</h2>
            </div>

            <div className={`rounded-2xl border p-6 ${getRiskBg(result.risk_score)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700">Risk Score</span>
                <span className={`text-3xl font-extrabold ${getRiskColor(result.risk_score)}`}>
                  {result.risk_score?.toFixed(1)} / 100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${result.risk_score >= 70 ? 'bg-red-500' : result.risk_score >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${result.risk_score}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-brand-light rounded-2xl p-4 border border-brand/20">
                <p className="text-xs font-bold text-brand uppercase tracking-wider mb-1">Condition</p>
                <p className="font-bold text-slate-800 text-lg">{result.disease_type || 'General Health'}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Overall Status</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.overall_status)}
                  <p className="font-bold text-slate-800 text-lg">{result.overall_status}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-slate-700 mb-2">⚠️ Medical Concerns</h3>
              <p className="text-slate-600 leading-relaxed">{result.concerns}</p>
            </div>

            <div className="bg-brand-light rounded-2xl p-6 border border-brand/20">
              <h3 className="font-bold text-slate-700 mb-2">🏃 Exercise Plan</h3>
              <p className="text-slate-600 leading-relaxed">{result.exercise_plan}</p>
            </div>

            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
              <h3 className="font-bold text-slate-700 mb-2">🥗 Diet Plan</h3>
              <p className="text-slate-600 leading-relaxed">{result.food_plan}</p>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg"
            >
              View Full Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}