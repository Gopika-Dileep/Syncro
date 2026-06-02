import { z } from 'zod';

export const AIAssignmentSchema = z.object({
  assignedEmployeeId: z.string().describe('The exact ID of the chosen employee'),
  assignedEmployeeName: z.string().describe('The name of the chosen employee'),
  reasoning: z.string().describe('Detailed explanation of why they are the best fit based on skills and workload'),
  confidenceScore: z.number().min(1).max(10).describe('Confidence score of the match from 1 to 10'),
});

export type AIAssignmentResponse = z.infer<typeof AIAssignmentSchema>;

export interface AIAssignTaskDTO {
  task: Record<string, unknown>;
  employees: Record<string, unknown>[];
}

