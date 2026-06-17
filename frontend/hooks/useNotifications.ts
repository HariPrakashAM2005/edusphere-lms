import { useEffect, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export interface NotificationData {
  id: string;
  userId: string;
  type: 'assignment_graded' | 'new_announcement' | 'certificate_issued' | 'attendance_marked' | 'quiz_result_available';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Fetch notification history
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get<NotificationData[]>('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [user]);

  // Mark single notification or all notifications as read
  const markRead = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        id === 'all'
          ? prev.map((n) => ({ ...n, isRead: true }))
          : prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read:`, error);
    }
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    // Load notification history
    fetchNotifications();

    // Connect to WebSocket Server
    const socket: Socket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('🔌 Connected to notification websocket');
      setIsConnected(true);
      // Join user specific room
      socket.emit('join', user.id);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from notification websocket');
      setIsConnected(false);
    });

    socket.on('notification', (newNotification: NotificationData) => {
      console.log('🔔 New real-time notification:', newNotification);
      
      // Update local notifications list
      setNotifications((prev) => [newNotification, ...prev]);

      // Emit global custom event for slide-in toasts
      const event = new CustomEvent('new-notification', {
        detail: newNotification,
      });
      window.dispatchEvent(event);
    });

    return () => {
      socket.disconnect();
    };
  }, [user, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markRead,
    refetch: fetchNotifications,
  };
};
export default useNotifications;
