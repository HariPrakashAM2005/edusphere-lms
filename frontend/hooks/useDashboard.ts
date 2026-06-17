import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface StudentStats {
  enrolledCourses: number;
  completionRate: number;
  attendanceRate: number;
  totalXp: number;
  streakCount: number;
}

export interface EnrolledCourse {
  courseId: string;
  title: string;
  description: string;
  progress: number;
  category: string;
  instructor: string;
  nextDeadline: string;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'text';
  completed: boolean;
  xpValue: number;
}

export interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface XPProgress {
  date: string;
  xp: number;
}

export interface Deadline {
  id: string;
  title: string;
  courseTitle: string;
  dueDate: string;
  type: 'assignment' | 'exam';
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  isCurrentUser?: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}

// Queries
export const useStats = () => {
  return useQuery<StudentStats>({
    queryKey: ['studentStats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/student/stats');
      return res.data;
    },
  });
};

export const useProgress = () => {
  return useQuery<XPProgress[]>({
    queryKey: ['learningProgress'],
    queryFn: async () => {
      const res = await api.get('/dashboard/student/progress');
      return res.data;
    },
  });
};

export const useCourses = () => {
  return useQuery<EnrolledCourse[]>({
    queryKey: ['enrolledCourses'],
    queryFn: async () => {
      const res = await api.get('/dashboard/student/courses');
      return res.data;
    },
  });
};

export const useCourseDetails = (courseId: string) => {
  return useQuery<Module[]>({
    queryKey: ['courseDetails', courseId],
    queryFn: async () => {
      const res = await api.get(`/dashboard/student/courses/${courseId}`);
      return res.data;
    },
    enabled: !!courseId,
  });
};

export const useUpcoming = () => {
  return useQuery<Deadline[]>({
    queryKey: ['upcomingDeadlines'],
    queryFn: async () => {
      const res = await api.get('/dashboard/student/upcoming');
      return res.data;
    },
  });
};

export const useLeaderboard = () => {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard/student/xp/leaderboard');
      return res.data;
    },
  });
};

export const useBadges = () => {
  return useQuery<Badge[]>({
    queryKey: ['badges'],
    queryFn: async () => {
      const res = await api.get('/dashboard/student/badges');
      return res.data;
    },
  });
};

// Mutations
export const useCompleteLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonId: string) => {
      const res = await api.post(`/dashboard/student/lessons/${lessonId}/complete`);
      return res.data;
    },
    // Optimistic Update
    onMutate: async (lessonId) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['courseDetails'] });

      // We don't have the courseId here, so we let the mutation resolve and invalidate queries instead,
      // or perform generic cache update if we had courseId.
      return { lessonId };
    },
    onSuccess: (data) => {
      // Invalidate stats, courses, details, progress to update everything
      queryClient.invalidateQueries({ queryKey: ['studentStats'] });
      queryClient.invalidateQueries({ queryKey: ['enrolledCourses'] });
      queryClient.invalidateQueries({ queryKey: ['courseDetails', data.courseId] });
      queryClient.invalidateQueries({ queryKey: ['learningProgress'] });
    },
  });
};

export const useClaimStreak = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post('/dashboard/student/claim-streak');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentStats'] });
    },
  });
};
