export interface IDeleteSprintService {
  execute(sprintId: string): Promise<{ message: string }>;
}
