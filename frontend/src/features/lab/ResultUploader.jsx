import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Loader2,
  Plus
} from 'lucide-react';

// Relative imports based on your feature-based architecture
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import FormInput from '../../components/shared/FormInput';
import NotificationToast from '../../components/shared/NotificationToast';

const ResultUploader = () => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success

  // Drag and Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const addFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => 
      ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)
    );
    setFiles(prev => [...prev, ...validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      progress: 0
    }))]);
  };

  const removeFile = (id) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const handleUpload = async () => {
    setUploadStatus('uploading');
    // Simulate API upload process
    await new Promise(resolve => setTimeout(resolve, 2500));
    setUploadStatus('success');
    setTimeout(() => {
      setUploadStatus('idle');
      setFiles([]);
    }, 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      {uploadStatus === 'success' && (
        <NotificationToast 
          type="success"
          message="Results Uploaded"
          description="Reports have been attached to the patient's medical history."
        />
      )}

      <Card 
        title="Lab Result Uploader" 
        subtitle="Digitize and attach diagnostic reports to patient records"
      >
        {/* 1. Metadata Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <FormInput label="Patient ID / Name" placeholder="e.g. Alexander Thompson" icon={FileText} />
          <FormInput label="Test Category" placeholder="e.g. Hematology" icon={Plus} />
        </div>

        {/* 2. Drag & Drop Zone */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-3xl p-10 transition-all duration-300 flex flex-col items-center justify-center text-center
            ${isDragging ? 'border-indigo-500 bg-indigo-50 scale-[0.99]' : 'border-slate-200 bg-slate-50 hover:border-indigo-300'}
            ${uploadStatus === 'uploading' ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm mb-4">
            <Upload size={32} />
          </div>
          <h4 className="text-slate-800 font-bold text-lg">Click or drag to upload</h4>
          <p className="text-slate-500 text-sm mt-1 max-w-xs">
            Support for PDF, JPG, and PNG medical reports (Max 10MB per file)
          </p>
          <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer" 
            multiple 
            onChange={(e) => addFiles(Array.from(e.target.files))}
          />
        </div>

        {/* 3. File List */}
        {files.length > 0 && (
          <div className="mt-8 space-y-3">
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pending Files ({files.length})</h5>
            {files.map((f) => (
              <div key={f.id} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl group animate-in slide-in-from-left-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <File size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{f.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{f.size}</p>
                </div>
                <button 
                  onClick={() => removeFile(f.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 4. Actions */}
        <div className="mt-10 pt-6 border-t border-slate-50 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setFiles([])}>Clear All</Button>
          <Button 
            variant="primary" 
            className="px-8 shadow-lg shadow-indigo-100"
            disabled={files.length === 0 || uploadStatus === 'uploading'}
            onClick={handleUpload}
            isLoading={uploadStatus === 'uploading'}
          >
            {uploadStatus === 'uploading' ? 'Processing...' : 'Process Results'}
          </Button>
        </div>

        {/* 5. Privacy Guardrail */}
        <div className="mt-6 p-4 bg-emerald-50 rounded-2xl flex gap-3 border border-emerald-100">
          <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
          <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
            <strong>Encryption Active:</strong> Your files are encrypted during transit and at rest. CareSync ensures all uploads meet HIPAA standards for medical data protection.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ResultUploader;