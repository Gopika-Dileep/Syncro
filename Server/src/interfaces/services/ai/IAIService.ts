export interface IAIService {
  assignTask(
    task: Record<string, unknown>,
    employees: Record<string, unknown>[],
  ): Promise<{
    assignedEmployeeId: string;
    assignedEmployeeName: string;
    reasoning: string;
    confidenceScore: number;
  }>;
}
