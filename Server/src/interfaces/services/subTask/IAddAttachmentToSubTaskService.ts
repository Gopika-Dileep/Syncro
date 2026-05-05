import { ISubTask } from '../../../models/subTask.model';

export interface IAddAttachmentToSubTaskService {
  execute(subTaskId: string, userId: string, attachments: { file_url: string; file_name: string }[]): Promise<ISubTask>;
}
