/* eslint-disable react-refresh/only-export-components */
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
    const [socket, setSocket] = useState<Socket | null>(null);
    const socketRef = useRef<Socket | null>(null);

    const joinRoom = (room: string) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('join_room', room);
        }
    };

    useEffect(() => {
        if (token && user) {

            if (socketRef.current) return;

            console.log('Initializing socket connection...');
            let socketUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            try {
                const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
                socketUrl = new URL(baseUrl).origin;
            } catch (err) {
                console.warn('Failed to parse socket URL, falling back to default', err);
            }
            
            const socketConn = io(socketUrl, {
                auth: { token },
                transports: ['websocket', 'polling'], 
                reconnectionAttempts: 10,
                autoConnect: false,
            });

            socketRef.current = socketConn;
            
            // Set socket state asynchronously to avoid calling setState synchronously within an effect
            const stateTimer = setTimeout(() => {
                if (socketRef.current) {
                    setSocket(socketConn);
                }
            }, 0);

           
            const connectionTimer = setTimeout(() => {
                if (socketRef.current) {
                    socketConn.connect();
                }
            }, 100);

            socketConn.on('connect', () => {
                setIsConnected(true);
                console.log('Socket connected successfully');
            });

            socketConn.on('connect_error', (err) => {
                console.error('Socket connection error:', err.message);
                setIsConnected(false);
            });

            socketConn.on('disconnect', (reason) => {
                setIsConnected(false);
                console.log('Socket disconnected:', reason);
            });

            socketConn.on('new_notification', (data) => {
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
                clearTimeout(stateTimer);
                if (socketRef.current) {
                    console.log('Cleaning up socket connection...');
                    socketRef.current.removeAllListeners();
                    socketRef.current.disconnect();
                    socketRef.current = null;
                    setSocket(null);
                }
            };
        }
    }, [token, user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, joinRoom }}>
            {children}
        </SocketContext.Provider>
    );
};
