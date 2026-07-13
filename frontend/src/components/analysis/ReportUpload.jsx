import { useRef, useState } from 'react';
import { UploadCloud, FileText, X, CheckCircle } from 'lucide-react';

export default function ReportUpload({ file, setFile, loading, onSubmit, error }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === 'application/pdf') {
      setFile(dropped);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-5">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
          ${isDragging
            ? 'border-blue-500 bg-blue-50 scale-[1.01]'
            : file
            ? 'border-emerald-400 bg-emerald-50/60 cursor-default'
            : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40'
          }`}
        style={{ minHeight: '180px' }}
        role="button"
        aria-label="Upload PDF medical report"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !file && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => { setFile(e.target.files[0]); }}
          disabled={loading}
        />

        <div className="flex flex-col items-center justify-center p-10 text-center">
          {file ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
              <p className="font-bold text-slate-800 text-lg">{file.name}</p>
              <p className="text-sm text-slate-500 mt-1">{formatSize(file.size)} · PDF</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Remove file
              </button>
            </>
          ) : (
            <>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-blue-100' : 'bg-slate-100'}`}>
                <UploadCloud className={`w-7 h-7 transition-colors ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
              </div>
              <p className="font-bold text-slate-700 text-lg">
                {isDragging ? 'Drop your PDF here' : 'Drag & drop your medical report'}
              </p>
              <p className="text-sm text-slate-400 mt-1.5">or <span className="text-blue-600 font-semibold">browse files</span></p>
              <p className="text-xs text-slate-400 mt-3">Supports: Blood tests, ECG, CBC, Lipid panel, Thyroid, Discharge summaries</p>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm">
          <div className="flex items-start gap-3">
            <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="flex-1 leading-relaxed">{error}</span>
          </div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="self-start text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-100 hover:bg-rose-200/80 px-3 py-1.5 rounded-lg transition-all active:scale-95 disabled:opacity-50"
          >
            Retry Analysis
          </button>
        </div>
      )}


      {/* Submit */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={!file || loading}
        className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all duration-200 shadow-lg
          ${file && !loading
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        aria-label="Analyze medical report with AI"
      >
        <FileText className="w-5 h-5" />
        {loading ? 'Analyzing...' : 'Analyze with AI'}
      </button>

      <p className="text-center text-xs text-slate-400">Your report is processed securely. We never store raw PDF files.</p>
    </div>
  );
}
