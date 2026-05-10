import React, { useState } from 'react';
import { Upload, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { Toast } from '../common/Toast';
import { analyzeCVForInterview } from '../../services/interviewService';

// Props interface eka ain kara
export const CVSetupStep = ({
  cvData, setCvData, jobDescription, setJobDescription, onNext
}) => {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [toast, setToast] = useState({
    open: false, title: '', msg: '', type: 'info'
  });

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setAnalyzed(false);
    }
  };

  const handleAnalyzeCV = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    try {
      const data = await analyzeCVForInterview(file);
      setCvData(data);
      setAnalyzed(true);
      setToast({ open: true, title: 'Success', msg: 'CV analyzed!', type: 'success' });
    } catch {
      setToast({ open: true, title: 'Error', msg: 'CV analysis failed.', type: 'error' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Setup Your Interview</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Upload your CV to generate personalized questions.
        </p>
      </div>

      {/* Step 1: Upload CV */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          Step 1 — Upload CV
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
            />
            <div className={`h-10 px-4 flex items-center gap-3 border rounded-xl transition-all ${
              file
                ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-950/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}>
              <Upload size={15} className={file ? 'text-primary-500' : 'text-gray-400'} />
              <span className={`text-sm truncate ${
                file ? 'text-gray-900 dark:text-white' : 'text-gray-400'
              }`}>
                {file ? file.name : 'Choose PDF file...'}
              </span>
            </div>
          </div>

          <Button
            onClick={handleAnalyzeCV}
            disabled={!file || isAnalyzing}
            loading={isAnalyzing}
            variant={analyzed ? 'secondary' : 'primary'}
            icon={analyzed ? <CheckCircle size={15} /> : undefined}
          >
            {analyzed ? 'Analyzed' : 'Analyze CV'}
          </Button>
        </div>

        {/* CV Profile preview */}
        {analyzed && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 animate-fade-in">
            {[
              { label: 'Role',      value: cvData.role },
              { label: 'Level',     value: cvData.experience_level },
              { label: 'Education',  value: cvData.education || 'N/A' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {item.label}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 truncate">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {analyzed && cvData.skills && cvData.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {cvData.skills.slice(0, 10).map((skill, i) => (
              <span key={i} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700">
                #{skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Step 2: Job Description */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Step 2 — Job Description <span className="text-red-500">*</span>
          </p>
          {!jobDescription.trim() && (
            <span className="text-[10px] text-orange-500 font-medium italic">Required to proceed</span>
          )}
        </div>
        <textarea
          value={jobDescription}
          onChange={e => setJobDescription(e.target.value)}
          placeholder="Paste the job description for more relevant questions..."
          rows={4}
          className={`w-full px-4 py-3 text-sm border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 resize-none transition-all ${
            !jobDescription.trim() ? 'border-orange-200 dark:border-orange-900/30' : 'border-gray-200 dark:border-gray-700'
          }`}
        />
      </div>

      <Button
        onClick={onNext}
        disabled={!analyzed || !jobDescription.trim()} 
        className="w-full"
        icon={<ChevronRight size={16} />}
      >
        Generate Interview Questions
      </Button>

      <Toast
        isOpen={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        title={toast.title}
        message={toast.msg}
        type={toast.type}
      />
    </div>
  );
};