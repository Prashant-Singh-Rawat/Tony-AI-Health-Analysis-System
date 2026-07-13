import React, { useState, useRef } from 'react';
import { Upload, Camera, FileText, CheckCircle, RefreshCw, Eye } from 'lucide-react';

export default function PrescriptionUpload({ onExtract }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [ocrStatus, setOcrStatus] = useState('idle'); // idle | parsing | complete
  const [extractedMeds, setExtractedMeds] = useState([]);
  const fileInputRef = useRef(null);

  const processFile = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setOcrStatus('parsing');
    setExtractedMeds([]);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl('');
    }

    // Simulate OCR text parsing
    setTimeout(() => {
      let mockMeds = ['Paracetamol 500mg', 'Atorvastatin 10mg'];
      if (selectedFile.name.toLowerCase().includes('antibiotic') || selectedFile.name.toLowerCase().includes('infection')) {
        mockMeds = ['Azithromycin 500mg', 'Paracetamol 650mg'];
      }
      setExtractedMeds(mockMeds);
      setOcrStatus('complete');
      onExtract(mockMeds);
    }, 2000);
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const clearUpload = () => {
    setFile(null);
    setPreviewUrl('');
    setOcrStatus('idle');
    setExtractedMeds([]);
  };

  return (
    <div className="glass-panel border border-border-subtle rounded-3xl p-6 shadow-sm mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-text-main text-base">Upload Prescription</h3>
          <p className="text-xs text-text-muted">Upload doctor prescription for quick verification and search auto-fill.</p>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,application/pdf"
        className="hidden"
      />

      {ocrStatus === 'idle' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Drag and Drop Zone */}
          <div
            onClick={triggerUpload}
            className="border-2 border-dashed border-border-subtle hover:border-brand-primary/60 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-bg-surface-hover/20 hover:bg-bg-surface-hover/45"
          >
            <Upload className="w-8 h-8 text-text-muted mb-2.5 animate-bounce" />
            <span className="text-sm font-semibold text-text-main">Choose PDF or Image</span>
            <span className="text-[10px] text-text-muted mt-1">Maximum file size: 10MB</span>
          </div>

          {/* Camera Capture Option */}
          <div
            onClick={() => {
              fileInputRef.current.setAttribute('capture', 'environment');
              triggerUpload();
            }}
            className="border-2 border-dashed border-border-subtle hover:border-brand-primary/60 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-bg-surface-hover/20 hover:bg-bg-surface-hover/45"
          >
            <Camera className="w-8 h-8 text-text-muted mb-2.5" />
            <span className="text-sm font-semibold text-text-main">Capture via Camera</span>
            <span className="text-[10px] text-text-muted mt-1">Instantly snap physical prescription</span>
          </div>
        </div>
      )}

      {ocrStatus === 'parsing' && (
        <div className="flex flex-col items-center justify-center py-10 space-y-3">
          <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
          <span className="text-sm font-semibold text-text-main">OCR Analysis Engine active...</span>
          <span className="text-xs text-text-muted">Digitizing handwriting & extracting medicines</span>
        </div>
      )}

      {ocrStatus === 'complete' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-bold text-text-main">{file?.name} (Verified)</span>
            </div>
            <button
              onClick={clearUpload}
              className="text-xs text-rose-500 font-bold hover:underline"
            >
              Remove
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {previewUrl && (
              <div className="md:w-1/3 border border-border-subtle rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center relative">
                <img src={previewUrl} alt="Prescription preview" className="w-full h-full object-cover opacity-80" />
                <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-[10px] text-white px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                  <Eye className="w-3 h-3" /> Live Capture
                </span>
              </div>
            )}
            <div className="flex-1 space-y-3">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                Extracted Medicines
              </span>
              <div className="flex flex-wrap gap-2">
                {extractedMeds.map((med, idx) => (
                  <span
                    key={idx}
                    className="bg-brand-primary/10 text-brand-primary text-xs font-bold px-3 py-1.5 rounded-xl border border-brand-primary/20 flex items-center gap-1.5 shadow-sm"
                  >
                    💊 {med}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-text-muted italic leading-relaxed pt-1">
                Extracted medicines have been auto-populated into your medicine search. You can click on the search bar to execute.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
