import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface ChatResponse {
  reply: string;
  intent: 'question' | 'request' | 'feedback' | 'general';
  suggestions: string[];
}

export interface Recommendation {
  courseId: string;
  title: string;
  description: string;
  score: number;
  reason: string;
}

export interface AtRiskStudent {
  id: string;
  studentId: string;
  name: string;
  email: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  factors: {
    attendance: number;
    grades: number;
    loginFrequency: number;
  };
  intervention: string;
  updatedAt: string;
}

export interface QuizQuestion {
  text: string;
  type: 'mcq' | 'truefalse' | 'fillblank';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  marks: number;
  difficulty: number;
}

export interface EssayGradeResult {
  score: number;
  plagiarismPercent: number;
  feedback: string;
  rubricBreakdown: {
    grammar: number;
    structure: number;
    contentDepth: number;
  };
}

// Queries
export const useCourseRecommendations = () => {
  return useQuery<Recommendation[]>({
    queryKey: ['courseRecommendations'],
    queryFn: async () => {
      const res = await api.post('/ai/recommend/courses');
      return res.data;
    }
  });
};

export const useAtRiskStudents = () => {
  return useQuery<AtRiskStudent[]>({
    queryKey: ['atRiskStudents'],
    queryFn: async () => {
      const res = await api.get('/ai/at-risk-students');
      return res.data;
    }
  });
};

// Mutations
export const useSendMessage = () => {
  return useMutation<ChatResponse, Error, { message: string; courseId?: string | null }>({
    mutationFn: async ({ message, courseId }) => {
      const res = await api.post('/ai/chat', { message, courseId });
      return res.data;
    }
  });
};

export const useGenerateQuizFromPDF = () => {
  return useMutation<QuizQuestion[], Error, { text: string; count?: number; difficulty?: string }>({
    mutationFn: async (payload) => {
      const res = await api.post('/ai/generate-quiz', payload);
      return res.data;
    }
  });
};

export const useGradeEssay = () => {
  return useMutation<EssayGradeResult, Error, { essay: string; rubric: string; totalMarks?: number }>({
    mutationFn: async (payload) => {
      const res = await api.post('/ai/grade-essay', payload);
      return res.data;
    }
  });
};
