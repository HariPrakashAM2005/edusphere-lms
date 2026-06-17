'use client';

import { useEffect } from 'react';
import { useRealtimeContext } from '../components/RealtimeProvider';
import toast from 'react-hot-toast';

interface RealtimeEvents {
  [eventName: string]: (data: any) => void;
}

/**
 * Hook to subscribe to course-specific websocket rooms and events.
 * Handles cleanups, room joins and room exits automatically.
 */
export default function useRealtime(courseId?: string, events?: RealtimeEvents) {
  const { socket, isConnected } = useRealtimeContext();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join specific course room
    if (courseId) {
      socket.emit('join_course', courseId);
      console.log(`🌐 Subscribed to course-room: ${courseId}`);
    }

    // Attach custom event handlers
    if (events) {
      Object.entries(events).forEach(([eventName, handler]) => {
        socket.on(eventName, handler);
      });
    }

    return () => {
      // Leave course room
      if (courseId) {
        socket.emit('leave_course', courseId);
        console.log(`🌐 Unsubscribed from course-room: ${courseId}`);
      }

      // Detach event handlers
      if (events) {
        Object.entries(events).forEach(([eventName, handler]) => {
          socket.off(eventName, handler);
        });
      }
    };
  }, [socket, isConnected, courseId, events]);

  return { socket, isConnected };
}
