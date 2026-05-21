import { injectable } from "inversify";
import { llm } from "../../config/llm";
import { IAIService } from "../../interfaces/services/ai/IAIService";
import { AIAssignmentSchema } from "../../dto/ai.dto";

@injectable()
export class AIService implements IAIService {
    async assignTask(task: any, employees: any[]) {
        // 1. Bind the schema to the LangChain model
        const structuredLlm = llm.withStructuredOutput(AIAssignmentSchema, {
            name: "assign_task",
        });

        // 3. We no longer need to manually explain the JSON format in the prompt
        const prompt = `You are an expert AI Project Manager. Your objective is to assign a specific task to the most suitable employee based on their skills and current workload.

Here is the task that needs to be assigned:
${JSON.stringify(task, null, 2)}

Here is the list of available employees, including their skills, roles, and current active tasks/workload:
${JSON.stringify(employees, null, 2)}

EVALUATION CRITERIA:
1. Skill Match: The employee must possess the skills required to complete the task successfully.
2. Workload/Availability: Prioritize employees who have fewer active tasks or more bandwidth. Avoid overloading employees.
3. Relevance: Consider if the employee's role aligns well with the task's domain.

Analyze the task requirements and evaluate each employee against the criteria above. Select the single best employee for the task.`;

        // 4. Invoke the model. LangChain automatically handles the parsing and validation!
        const result = await structuredLlm.invoke(prompt);
        
        return result; 
    }
}