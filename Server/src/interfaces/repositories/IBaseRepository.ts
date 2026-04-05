import mongoose from 'mongoose';

export interface IBaseRepository<T> {
  create(data: Partial<T> | any): Promise<T>;
  findById(id: string, options?: mongoose.QueryOptions): Promise<T | null>;
  findOne(filter: Record<string, any>, options?: mongoose.QueryOptions): Promise<T | null>;
  find(filter: Record<string, any>, options?: mongoose.QueryOptions): Promise<T[]>;
  updateById(id: string, update: Record<string, any>, options?: mongoose.QueryOptions): Promise<T | null>;
  updateOne(filter: Record<string, any>, update: Record<string, any>, options?: mongoose.QueryOptions): Promise<T | null>;
  deleteById(id: string): Promise<T | null>;
}
