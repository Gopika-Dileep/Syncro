import mongoose from 'mongoose';

export interface IBaseRepository<T> {
  create(data: Partial<T> | Record<string, unknown>): Promise<T>;
  findById(id: string, options?: mongoose.QueryOptions): Promise<T | null>;
  findOne(filter: Record<string, unknown>, options?: mongoose.QueryOptions): Promise<T | null>;
  find(filter: Record<string, unknown>, options?: mongoose.QueryOptions): Promise<T[]>;
  updateById(id: string, update: Record<string, unknown>, options?: mongoose.QueryOptions): Promise<T | null>;
  updateOne(filter: Record<string, unknown>, update: Record<string, unknown>, options?: mongoose.QueryOptions): Promise<T | null>;
  updateMany(filter: Record<string, unknown>, update: Record<string, unknown>): Promise<void>;
  deleteById(id: string): Promise<T | null>;
  deleteMany(filter: Record<string, unknown>): Promise<void>;
}
