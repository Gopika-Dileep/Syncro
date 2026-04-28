export interface IDeleteSubTaskService {
  execute(subTaskId: string): Promise<void>;
}
