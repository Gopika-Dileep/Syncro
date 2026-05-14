import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { toast } from 'sonner';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    joinRoom: (room: string) => void;
}

const SocketContext = createContext<SocketContextType>({ 
    socket: null, 
    isConnected: false,
    joinRoom: () => {}
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, user } = useSelector((state: RootState) => state.auth);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    const joinRoom = (room: string) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('join_room', room);
        }
    };

    useEffect(() => {
        if (token && user) {
            // Prevent duplicate connections if already connecting/connected
            if (socketRef.current) return;

            console.log('Initializing socket connection...');
            // Socket.io needs the base URL (origin), not the /api path.
            // Using new URL().origin is safer than string replacement.
            let socketUrl = 'http://localhost:5000';
            try {
                const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
                socketUrl = new URL(baseUrl).origin;
            } catch (err) {
                console.warn('Failed to parse socket URL, falling back to default', err);
            }
            
            const socket = io(socketUrl, {
                auth: { token },
                transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
                reconnectionAttempts: 10,
                autoConnect: false,
            });

            socketRef.current = socket;

            // Delay connection slightly (de-bounce) to avoid the "closed before established" warning
            // This allows React Strict Mode to finish its double-mount cycle before we try to connect
            const connectionTimer = setTimeout(() => {
                if (socketRef.current) {
                    socket.connect();
                }
            }, 100);

            socket.on('connect', () => {
                setIsConnected(true);
                console.log('Socket connected successfully');
            });

            socket.on('connect_error', (err) => {
                console.error('Socket connection error:', err.message);
                setIsConnected(false);
            });

            socket.on('disconnect', (reason) => {
                setIsConnected(false);
                console.log('Socket disconnected:', reason);
            });

            socket.on('new_notification', (data) => {
                toast.info(data.notification.title, {
                    description: data.notification.message,
                    action: data.notification.link ? {
                        label: 'View',
                        onClick: () => window.location.href = data.notification.link
                    } : undefined
                });
                
                window.dispatchEvent(new CustomEvent('notification_update', { detail: data }));
            });

            return () => {
                clearTimeout(connectionTimer);
                if (socketRef.current) {
                    console.log('Cleaning up socket connection...');
                    socketRef.current.removeAllListeners();
                    socketRef.current.disconnect();
                    socketRef.current = null;
                }
            };
        }
    }, [token, user]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, isConnected, joinRoom }}>
            {children}
        </SocketContext.Provider>
    );
};
