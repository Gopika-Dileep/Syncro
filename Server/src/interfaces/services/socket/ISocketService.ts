import { Server } from 'http';

export interface ISocketService {
  initialize(server: Server): void;
  emitToUser(userId: string, event: string, data: unknown): void;
  emitToRoom(room: string, event: string, data: unknown): void;
}
