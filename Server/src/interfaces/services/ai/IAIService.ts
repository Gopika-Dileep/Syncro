import { Document } from "mongoose";

export interface IAIService {
    assignTask(task: any, employees: any[]): Promise<{
        assignedEmployeeId: string;
        assignedEmployeeName: string;
        reasoning: string;
        confidenceScore: number;
    }>;
}
