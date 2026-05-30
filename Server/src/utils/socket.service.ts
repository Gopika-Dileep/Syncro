import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { injectable, inject } from 'inversify';
import { ISocketService } from '../interfaces/services/ISocketService';
import { verifyAccessToken } from './token.utils';
import { env } from '../config/env';
import logger from '../config/logger';
import { TYPES } from '../di/types';
import { IEmployeeRepository } from '../interfaces/repositories/IEmployeeRepository';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  employeeId?: string;
}

@injectable()
export class SocketService implements ISocketService {
  private io: SocketIOServer | null = null;

  constructor(
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository
  ) {}

  initialize(server: HttpServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: env.FRONTEND_URL,
        credentials: true,
      },
    });

    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      try {
        const decoded = verifyAccessToken(token) as { id: string };
        (socket as AuthenticatedSocket).userId = decoded.id;
        next();
      } catch (err) {
        return next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', async (socket: Socket) => {
      const authSocket = socket as AuthenticatedSocket;
      const userId = authSocket.userId;
      if (!userId) return;
      
      logger.info(`User connected to socket: ${userId}`);

      // Find employee ID for this user
      const employee = await this._employeeRepository.findOne({ user_id: userId });
      if (employee) {
        const employeeId = employee._id.toString();
        authSocket.employeeId = employeeId;
        socket.join(employeeId);
        logger.info(`Socket joined employee room: ${employeeId}`);
      }

      socket.join(userId);

      socket.on('join_room', (room: string) => {
        socket.join(room);
        logger.info(`User ${userId} joined room: ${room}`);
      });

      socket.on('leave_room', (room: string) => {
        socket.leave(room);
        logger.info(`User ${userId} left room: ${room}`);
      });

      socket.on('disconnect', () => {
        logger.info(`User disconnected from socket: ${userId}`);
      });
    });
  }

  emitToUser(userId: string, event: string, data: unknown): void {
    if (this.io) {
      this.io.to(userId).emit(event, data);
    }
  }

  emitToRoom(room: string, event: string, data: unknown): void {
    if (this.io) {
      this.io.to(room).emit(event, data);
    }
  }

  joinRoom(userId: string, room: string): void {
    // Note: This is harder to do from server-side without socket instance
    // Usually handled by client emitting 'join_room'
  }

  leaveRoom(userId: string, room: string): void {
    // Usually handled by client emitting 'leave_room'
  }
}
