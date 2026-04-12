import { injectable, unmanaged } from 'inversify';
import mongoose, { Model, Document } from 'mongoose';
import { IBaseRepository } from '../interfaces/repositories/IBaseRepository';

@injectable()
export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected _model: Model<T>;

  constructor(@unmanaged() model: Model<T>) {
    this._model = model;
  }

  async create(data: Partial<T> | Record<string, unknown>): Promise<T> {
    return await this._model.create(data as unknown as T);
  }

  async findById(id: string, options?: mongoose.QueryOptions): Promise<T | null> {
    return await this._model.findById(id, null, options).exec();
  }

  async findOne(filter: Record<string, unknown>, options?: mongoose.QueryOptions): Promise<T | null> {
    return await this._model.findOne(filter, null, options).exec();
  }

  async find(filter: Record<string, unknown>, options?: mongoose.QueryOptions): Promise<T[]> {
    return await this._model.find(filter, null, options).exec();
  }

  async updateById(id: string, update: Record<string, unknown>, options?: mongoose.QueryOptions): Promise<T | null> {
    return await this._model.findByIdAndUpdate(id, update, { new: true, ...options }).exec();
  }

  async updateOne(filter: Record<string, unknown>, update: Record<string, unknown>, options?: mongoose.QueryOptions): Promise<T | null> {
    return await this._model.findOneAndUpdate(filter, update, { new: true, ...options }).exec();
  }

  async deleteById(id: string): Promise<T | null> {
    return await this._model.findByIdAndDelete(id).exec();
  }

  async updateMany(filter: Record<string, unknown>, update: Record<string, unknown>): Promise<void> {
    await this._model.updateMany(filter, update).exec();
  }

  async deleteMany(filter: Record<string, unknown>): Promise<void> {
    await this._model.deleteMany(filter).exec();
  }
}
