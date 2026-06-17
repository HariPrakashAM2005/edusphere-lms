'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Wifi, WifiOff } from 'lucide-react';

interface RealtimeContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const RealtimeContext = createContext<RealtimeContextType>({
  socket: null,
  isConnected: false,
});

export const useRealtimeContext = () => useContext(RealtimeContext);

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export default function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only connect if user is logged in
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketInstance = io(SOCKET_URL, {
      withCredentials: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('🔌 WebSocket Connected');
      
      // Join user specific room
      socketInstance.emit('join', user.id);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('🔌 WebSocket Disconnected');
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Connection Error:', err);
    });

    // Listen for global and user specific notifications
    socketInstance.on('notification', (data: any) => {
      // Trigger a browser custom event so DashboardLayout or other listeners can capture it
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('new-notification', { detail: data });
        window.dispatchEvent(event);
      }
      toast.success(data.message || 'New notification received!', {
        duration: 4000,
        icon: '🔔',
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  return (
    <RealtimeContext.Provider value={{ socket, isConnected }}>
      {children}
      
      {/* Visual connection indicator */}
      {user && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg text-[10px] font-extrabold transition-all duration-300">
          <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-gray-650 dark:text-gray-400 uppercase tracking-wider">
            {isConnected ? 'Sync Active' : 'Offline'}
          </span>
          {isConnected ? (
            <Wifi className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <WifiOff className="h-3.5 w-3.5 text-rose-500" />
          )}
        </div>
      )}
    </RealtimeContext.Provider>
  );
}
