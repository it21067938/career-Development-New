import React, { useState } from 'react';
import { 
  Mic, Square, RotateCcw, ChevronRight, 
  MessageSquare, ChevronDown, ChevronUp, MicOff 
} from 'lucide-react';
import { Button } from '../common/Button';
import { Toast } from '../common/Toast';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { analyzeAnswer } from '../../services/interviewService';

export const InterviewStep = ({ questions, cvData, jobDescription, onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [toast, setToast] = useState({ 
    open: false, title: '', msg: '', type: 'info' 
  });

  const { 
    transcript, isListening, isSupported, 
    startListening, stopListening, setTranscript 
  } = useSpeechRecognition();

  const currentQuestion = questions[currentIdx];
  const progress = (currentIdx / questions.length) * 100;
  const isLast = currentIdx + 1 >= questions.length;

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setToast({ open: true, title: 'Error', msg: 'Please record your answer first.', type: 'error' });
      return;
    }

    setIsAnalyzing(true);
    try {
      const data = await analyzeAnswer(transcript, currentQuestion, cvData, jobDescription);
      
      const result = {
        question: currentQuestion,
        transcript,
        nlp_analysis: data.nlp_analysis,
        ai_feedback: data.ai_feedback
      };

      const updated = [...results, result];
      setResults(updated);

      if (isLast) {
        onComplete(updated);
      } else {
        setCurrentIdx(prev => prev + 1);
        setTranscript('');
        setShowHint(false);
      }
    } catch {
      setToast({ open: true, title: 'Error', msg: 'Analysis failed. Try again.', type: 'error' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center py-16">
        <MicOff size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Speech recognition not supported.</p>
        <p className="text-sm text-gray-400 mt-1">Please use Chrome or Edge.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-900 dark:text-white">Question {currentIdx + 1} of {questions.length}</span>
          <span className="text-gray-400">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
        <span className="px-2.5 py-1 bg-primary-50 dark:bg-primary-950 text-primary-600 text-[11px] font-bold rounded-full border border-primary-100 uppercase tracking-widest">
          {currentQuestion.type.replace(/_/g, ' ')}
        </span>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary-50 dark:bg-primary-950 rounded-lg shrink-0">
            <MessageSquare size={18} className="text-primary-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white leading-relaxed">{currentQuestion.question}</p>
        </div>
        <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-500">
          {showHint ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {showHint ? 'Hide hint' : 'Show hint'}
        </button>
        {showHint && <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-500 border border-gray-100">💡 {currentQuestion.hint}</div>}
      </div>

      {/* Recording Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Your Answer</p>
          {transcript && <span className="text-xs text-gray-400">{transcript.split(' ').filter(Boolean).length} words</span>}
        </div>
        <div className={`min-h-[120px] p-4 rounded-xl border transition-all ${isListening ? 'border-danger-400 bg-danger-50/30' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'}`}>
          {isListening && !transcript ? (
            <div className="flex items-center gap-2 text-danger-500">
              <span className="text-sm">Listening...</span>
            </div>
          ) : transcript ? (
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{transcript}</p>
          ) : (
            <p className="text-sm text-gray-400">Press mic and start speaking...</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!isListening ? (
            <button onClick={startListening} className="flex items-center gap-2 px-5 py-2.5 bg-danger-500 text-white rounded-xl text-sm font-semibold hover:bg-danger-600 transition-all">
              <Mic size={16} /> Start Recording
            </button>
          ) : (
            <button onClick={stopListening} className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-semibold">
              <Square size={14} /> Stop Recording
            </button>
          )}
          {transcript && !isListening && (
            <button onClick={() => setTranscript('')} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600">
              <RotateCcw size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      <Button onClick={handleAnalyze} disabled={!transcript.trim() || isListening} loading={isAnalyzing} className="w-full" icon={<ChevronRight size={16} />}>
        {isAnalyzing ? 'Analyzing...' : isLast ? 'Finish & See Results' : 'Analyze & Next'}
      </Button>

      <Toast isOpen={toast.open} onClose={() => setToast({ ...toast, open: false })} title={toast.title} message={toast.msg} type={toast.type} />
    </div>
  );
};