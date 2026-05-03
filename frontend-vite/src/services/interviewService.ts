import nodeClient from '../api/node/nodeClient';
import type { CVData, Question, AnswerResult } from '../types/interview';

export const analyzeCVForInterview = async (file: File): Promise<CVData> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('country', 'lk');

  const response = await nodeClient.post('/interview/analyze-cv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  const data = response.data;
  return {
    role:                data.role                || '',
    industry:            data.industry            || '',
    experience_level:    data.experience_level    || '',
    years_of_experience: data.years_of_experience || '',
    education:           data.education           || '',
    skills:              data.extracted_skills    || []
  };
};

export const generateQuestions = async (
  cvData: CVData,
  jobDescription: string
): Promise<Question[]> => {
  const response = await nodeClient.post('/interview/generate-questions', {
    cv_data:         cvData,
    job_description: jobDescription
  });
  return response.data.questions;
};

export const analyzeAnswer = async (
  text: string,
  question: Question,
  cvData: CVData,
  jobDescription: string
): Promise<{ nlp_analysis: AnswerResult['nlp_analysis']; ai_feedback: AnswerResult['ai_feedback'] }> => {
  const response = await nodeClient.post('/interview/analyze-answer', {
    text,
    question:        question.question,
    question_type:   question.type,
    cv_data:         cvData,
    job_description: jobDescription
  });
  return response.data;
};