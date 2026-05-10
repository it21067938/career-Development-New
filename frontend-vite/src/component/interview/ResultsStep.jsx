import React, { useState } from 'react';
import { 
  RotateCcw, CheckCircle, AlertCircle, 
  Award, Volume2, ChevronDown, ChevronUp 
} from 'lucide-react';
import { Button } from '../common/Button';

export const ResultsStep = ({ results, onRestart }) => {
  const [expandedIdx, setExpandedIdx] = useState(0);

  const avg = (fn) => 
    Math.round(results.reduce((s, r) => s + fn(r), 0) / results.length * 10) / 10;

  const avgOverall = avg(r => r.nlp_analysis.overall_score);
  const avgProfessionalism = avg(r => r.nlp_analysis.quality_score);
  const totalFillers = results.reduce((s, r) => s + r.nlp_analysis.filler_analysis.total_filler_count, 0);
  const totalGrammar = results.reduce((s, r) => s + r.nlp_analysis.grammar_analysis.error_count, 0);

  const scoreColor = (s) => 
    s >= 7.5 ? 'text-success-600 dark:text-success-400' 
      : s >= 5 ? 'text-primary-600 dark:text-primary-400' 
        : 'text-danger-500';

  const barColor = (s) => 
    s >= 7.5 ? 'bg-success-500' : s >= 5 ? 'bg-primary-500' : 'bg-danger-500';

  const levelBadge = (level) => {
    const map = {
      'Excellent': 'bg-success-50 text-success-600 border-success-200 dark:bg-success-950 dark:text-success-400 dark:border-success-800',
      'Good': 'bg-primary-50 text-primary-600 border-primary-200 dark:bg-primary-950 dark:text-primary-400 dark:border-primary-800',
      'Average': 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
      'Poor': 'bg-danger-50 text-danger-500 border-danger-200 dark:bg-danger-950 dark:text-danger-400 dark:border-danger-800',
      'Very Poor': 'bg-danger-50 text-danger-500 border-danger-200 dark:bg-danger-950 dark:text-danger-400 dark:border-danger-800',
    };
    return map[level] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Interview Results</h2>
          <p className="text-sm text-gray-500 mt-1">{results.length} questions completed</p>
        </div>
        <Button variant="secondary" onClick={onRestart} icon={<RotateCcw size={15} />}>
          Restart
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Overall Score', value: `${avgOverall}/10`, color: scoreColor(avgOverall) },
          { label: 'Professionalism', value: `${avgProfessionalism}/10`, color: scoreColor(avgProfessionalism) },
          { label: 'Filler Words', value: totalFillers, color: totalFillers > 5 ? 'text-danger-500' : 'text-success-600 dark:text-success-400' },
          { label: 'Grammar Issues', value: totalGrammar, color: totalGrammar > 3 ? 'text-danger-500' : 'text-success-600 dark:text-success-400' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Per question details */}
      <div className="space-y-3">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">Per Question Breakdown</p>
        {results.map((result, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <button
              onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {result.question.question}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${levelBadge(result.nlp_analysis.communication_level)}`}>
                      {result.nlp_analysis.communication_level}
                    </span>
                    <span className={`text-xs font-bold ${scoreColor(result.nlp_analysis.overall_score)}`}>
                      {result.nlp_analysis.overall_score}/10
                    </span>
                  </div>
                </div>
              </div>
              {expandedIdx === idx ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>

            {expandedIdx === idx && (
              <div className="px-5 pb-5 space-y-5 border-t border-gray-100 dark:border-gray-800 pt-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Quality', score: result.nlp_analysis.quality_score },
                    { label: 'Filler', score: result.nlp_analysis.filler_analysis.score },
                    { label: 'Grammar', score: result.nlp_analysis.grammar_analysis.score },
                  ].map((s, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">{s.label}</span>
                        <span className={`font-bold ${scoreColor(s.score)}`}>{s.score}/10</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${barColor(s.score)}`} style={{ width: `${s.score * 10}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Answer</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 leading-relaxed">
                    {result.transcript}
                  </p>
                </div>

                {result.nlp_analysis.issues.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Issues Detected</p>
                    {result.nlp_analysis.issues.map((issue, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-danger-600 dark:text-danger-400">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        {issue}
                      </div>
                    ))}
                  </div>
                )}

                {result.ai_feedback && !result.ai_feedback.error && (
                  <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
                      "{result.ai_feedback.overall_feedback}"
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-success-600 uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle size={11} /> Strengths
                        </p>
                        {(result.ai_feedback.strengths || []).map((s, i) => (
                          <p key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
                            <span className="text-success-500 mt-0.5">✓</span> {s}
                          </p>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-danger-500 uppercase tracking-widest flex items-center gap-1">
                          <AlertCircle size={11} /> Improvements
                        </p>
                        {(result.ai_feedback.improvements || []).map((s, i) => (
                          <p key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
                            <span className="text-danger-400 mt-0.5">→</span> {s}
                          </p>
                        ))}
                      </div>
                    </div>

                    {result.ai_feedback.better_version && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest flex items-center gap-1">
                          <Volume2 size={11} /> Better Version
                        </p>
                        <p className="text-xs text-gray-600 bg-primary-50 dark:bg-primary-950 border border-primary-100 dark:border-primary-900 rounded-xl p-3 leading-relaxed italic">
                          "{result.ai_feedback.better_version}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};