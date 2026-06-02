export interface IBaseRepository<T> {
  create(data: Partial<T> | Record<string, unknown>): Promise<T>;
  findById(id: string, options?: Record<string, unknown>): Promise<T | null>;
  findOne(filter: Record<string, unknown>, options?: Record<string, unknown>): Promise<T | null>;
  find(filter: Record<string, unknown>, options?: Record<string, unknown>): Promise<T[]>;
  updateById(id: string, update: Record<string, unknown>, options?: Record<string, unknown>): Promise<T | null>;
  updateOne(filter: Record<string, unknown>, update: Record<string, unknown>, options?: Record<string, unknown>): Promise<T | null>;
  updateMany(filter: Record<string, unknown>, update: Record<string, unknown>): Promise<void>;
  deleteById(id: string): Promise<T | null>;
  deleteMany(filter: Record<string, unknown>): Promise<void>;
  count(filter: Record<string, unknown>): Promise<number>;
}
