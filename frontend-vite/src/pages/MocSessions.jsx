import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { CVSetupStep } from '../component/interview/CVSetupStep';
import { InterviewStep } from '../component/interview/InterviewStep';
import { ResultsStep } from '../component/interview/ResultsStep';
import { Toast } from '../component/common/Toast';
import { generateQuestions } from '../services/interviewService';


const StepIndicator = ({ step }) => {
  const order = {
    setup: 0, loading: 1, interview: 1, results: 2
  };
  const current = order[step];

  return (
    <div className="flex items-center gap-2">
      {[
        { key: 'setup', label: 'Setup' },
        { key: 'interview', label: 'Interview' },
        { key: 'results', label: 'Results' },
      ].map((s, i) => {
        const isActive = order[s.key] === current;
        const isDone = order[s.key] < current;
        return (
          <React.Fragment key={s.key}>
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${isActive ? 'text-primary-600 dark:text-primary-400'
                : isDone ? 'text-success-600 dark:text-success-400'
                  : 'text-gray-400'
              }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive ? 'bg-primary-500 text-white'
                  : isDone ? 'bg-success-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}>
                {isDone ? '✓' : i + 1}
              </div>
              {s.label}
            </div>
            {i < 2 && (
              <div className={`flex-1 h-px ${isDone ? 'bg-success-300 dark:bg-success-700' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const MocSessions = () => {
  const [step, setStep] = useState('setup');
  const [cvData, setCvData] = useState({
    role: '', industry: '', experience_level: '',
    years_of_experience: '', education: '', skills: []
  });
  const [jobDescription, setJobDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [toast, setToast] = useState({
    open: false, title: '', msg: '', type: 'info'
  });

  const handleGenerateQuestions = async () => {
    setStep('loading');
    try {
      const qs = await generateQuestions(cvData, jobDescription);
      setQuestions(qs);
      setStep('interview');
    } catch {
      setToast({ open: true, title: 'Error', msg: 'Failed to generate questions.', type: 'error' });
      setStep('setup');
    }
  };

  const handleRestart = () => {
    setStep('setup');
    setQuestions([]);
    setResults([]);
    setCvData({ role: '', industry: '', experience_level: '', years_of_experience: '', education: '', skills: [] });
    setJobDescription('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mock Interview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Practice with AI-powered feedback and NLP analysis.
        </p>
      </div>

      {step !== 'loading' && <StepIndicator step={step} />}

      {step === 'setup' && (
        <CVSetupStep
          cvData={cvData}
          setCvData={setCvData}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          onNext={handleGenerateQuestions}
        />
      )}

      {step === 'loading' && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={40} className="animate-spin text-primary-500" />
          <p className="text-gray-500 font-medium">Generating personalized questions...</p>
        </div>
      )}

      {step === 'interview' && (questions?.length ?? 0) > 0 && (
        <InterviewStep
          questions={questions}
          cvData={cvData}
          jobDescription={jobDescription}
          onComplete={(r) => { setResults(r); setStep('results'); }}
        />
      )}

      {step === 'results' && (
        <ResultsStep results={results} onRestart={handleRestart} />
      )}

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

export default MocSessions;