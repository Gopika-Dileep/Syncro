import { Server } from 'http';

export interface ISocketService {
  initialize(server: Server): void;
  emitToUser(userId: string, event: string, data: unknown): void;
  emitToRoom(room: string, event: string, data: unknown): void;
  joinRoom(userId: string, room: string): void;
  leaveRoom(userId: string, room: string): void;
}
