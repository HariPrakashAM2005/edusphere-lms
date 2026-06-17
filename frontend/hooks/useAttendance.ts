import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface AttendanceRecord {
  id: string;
  courseId: string;
  courseTitle: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  method: string;
  location: string;
}

export interface FacultyAttendanceRecord {
  id: string;
  studentName: string;
  studentEmail: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  method: string;
  location: string;
}

export interface AttendanceAnalytics {
  totalSessions: number;
  averageAttendance: number;
  defaulters: { name: string; email: string; attendance: number }[];
  trends: { date: string; present: number }[];
}

export interface QRResponse {
  token: string;
  qrCodeDataUrl: string;
  expiresIn: number;
}

// Queries
export const useStudentAttendanceHistory = () => {
  return useQuery<AttendanceRecord[]>({
    queryKey: ['studentAttendanceHistory'],
    queryFn: async () => {
      const res = await api.get('/attendance/student/attendance/my-records');
      return res.data;
    },
  });
};

export const useFacultyAttendance = (courseId: string) => {
  return useQuery<FacultyAttendanceRecord[]>({
    queryKey: ['facultyAttendance', courseId],
    queryFn: async () => {
      const res = await api.get(`/attendance/faculty/attendance/course/${courseId}`);
      return res.data;
    },
    enabled: !!courseId,
  });
};

export const useAttendanceAnalytics = (courseId: string) => {
  return useQuery<AttendanceAnalytics>({
    queryKey: ['attendanceAnalytics', courseId],
    queryFn: async () => {
      const res = await api.get(`/attendance/faculty/attendance/analytics/${courseId}`);
      return res.data;
    },
    enabled: !!courseId,
  });
};

// Mutations
export const useMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { token: string; lat: number; lon: number; faceImageBase64?: string }) => {
      const res = await api.post('/attendance/student/attendance/mark', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentAttendanceHistory'] });
    },
  });
};

export const useGenerateQR = () => {
  return useMutation<QRResponse, Error, { courseId: string }>({
    mutationFn: async ({ courseId }) => {
      const res = await api.post('/attendance/faculty/attendance/generate-qr', { courseId });
      return res.data;
    },
  });
};

export const useManualOverrideAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ attendanceId, status }: { attendanceId: string; status: string }) => {
      const res = await api.put(`/attendance/faculty/attendance/${attendanceId}`, { status });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['facultyAttendance'] });
    },
  });
};
