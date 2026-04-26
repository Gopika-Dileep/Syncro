export interface IDeleteTaskService {
  execute(taskId: string): Promise<void>;
}
