export interface CVData {
  role: string;
  industry: string;
  experience_level: string;
  years_of_experience: string;
  education: string;
  skills: string[];
}

export interface Question {
  id: number;
  type: string;
  question: string;
  hint: string;
}

export interface NLPAnalysis {
  communication_level: string;
  level_number: number;
  quality_score: number;
  overall_score: number;
  confidence: Record<string, number>;
  filler_analysis: {
    detected_fillers: Record<string, number>;
    total_filler_count: number;
    score: number;
    word_count: number;
  };
  grammar_analysis: {
    error_count: number;
    score: number;
    errors: { type: string; description: string; found: string }[];
  };
  issues: string[];
  word_count: number;
}

export interface AIFeedback {
  overall_feedback: string;
  strengths: string[];
  improvements: string[];
  better_version: string;
  tip: string;
}

export interface AnswerResult {
  question: Question;
  transcript: string;
  nlp_analysis: NLPAnalysis;
  ai_feedback: AIFeedback;
}

export type InterviewStep = 'setup' | 'loading' | 'interview' | 'results';