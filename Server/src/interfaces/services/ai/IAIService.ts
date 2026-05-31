import { AIAssignTaskDTO } from '../../../dto/ai.dto';

export interface IAIService {
  assignTask(query: AIAssignTaskDTO): Promise<{
    assignedEmployeeId: string;
    assignedEmployeeName: string;
    reasoning: string;
    confidenceScore: number;
  }>;
}

