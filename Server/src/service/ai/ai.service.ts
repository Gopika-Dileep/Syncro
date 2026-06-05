import { injectable } from 'inversify';
import { z } from 'zod';
import { llm } from '../../config/llm';
import { IAIService } from '../../interfaces/services/ai/IAIService';
import { AIAssignmentSchema, AIAssignTaskDTO } from '../../dto/ai.dto';

@injectable()
export class AIService implements IAIService {
  async assignTask(query: AIAssignTaskDTO) {
    const { task, employees } = query;
    const structuredLlm = llm.withStructuredOutput(AIAssignmentSchema, {
      name: 'assign_task',
    });

    const prompt = `You are an expert AI Project Manager. Your objective is to assign a specific task to the most suitable employee based on their team/specialization, skills, and current workload.

Here is the task that needs to be assigned:
${JSON.stringify(task, null, 2)}

Here is the list of available employees, including their skills, team/specialization, roles, and current active tasks/workload:
${JSON.stringify(employees, null, 2)}

EVALUATION CRITERIA:
1. Team & Role Alignment (CRITICAL): Match the technical nature of the task with the employee's team name:
   - If the task is backend-focused (e.g., API creation, database/Mongoose schemas, Express routing, controllers, server configurations, integrations), prioritize employees belonging to the "Backend" team.
   - If the task is frontend-focused (e.g., UI designs, CSS/Tailwind layouts, React page templates, state management, components, interactive forms), prioritize employees belonging to the "Frontend" team.
2. Skill Match: The employee must possess the skills required to complete the task successfully.
3. Workload/Availability: Prioritize employees who have fewer active tasks or more bandwidth. Avoid overloading employees.
4. Relevance: Consider if the employee's role aligns well with the task's domain.

Analyze the task requirements and evaluate each employee against the criteria above. Select the single best employee for the task.`;

    const result = await structuredLlm.invoke(prompt);

    return result;
  }

  async determineTeamForTask(query: { task: Record<string, unknown>; teams: string[] }) {
    const { task, teams } = query;
    const TeamClassificationSchema = z.object({
      matchedTeamName: z.string().describe('The exact name of the matched team from the list of provided teams.'),
    });

    const structuredLlm = llm.withStructuredOutput(TeamClassificationSchema, {
      name: 'determine_team',
    });

    const prompt = `You are an expert technical project coordinator. Analyze the following task details:
${JSON.stringify(task, null, 2)}

Based on the task content, classify which team is responsible for implementing it.
The available teams are: ${teams.join(', ')}.

Select the single best matching team name from the list. It must match one of the names exactly.`;

    const result = await structuredLlm.invoke(prompt);
    return result;
  }
}
