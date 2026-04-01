import { EmployeePermissionsDTO } from "../dto/employee.dto";

export class PermissionMapper {

    static toFlatKeys(p: Partial<EmployeePermissionsDTO>): string[] {
        const keys: string[] = [];

        if (p.project) {
            if (p.project.create) keys.push("project:create");
            if (p.project.view.team) keys.push("project:view:team");
            if (p.project.view.all) keys.push("project:view:all");
            if (p.project.update.team) keys.push("project:update:team");
            if (p.project.update.all) keys.push("project:update:all");
            if (p.project.delete) keys.push("project:delete");
        }

        if (p.task) {
            if (p.task.create) keys.push("task:create");
            if (p.task.view.team) keys.push("task:view:team");
            if (p.task.view.all) keys.push("task:view:all");
            if (p.task.assign.team) keys.push("task:assign:team");
            if (p.task.assign.all) keys.push("task:assign:all");
            if (p.task.update.team) keys.push("task:update:team");
            if (p.task.update.all) keys.push("task:update:all");
        }

        if (p.sprint) {
            if (p.sprint.create) keys.push("sprint:create");
            if (p.sprint.view.all) keys.push("sprint:view:all");
            if (p.sprint.update) keys.push("sprint:update");
            if (p.sprint.start) keys.push("sprint:start");
            if (p.sprint.complete) keys.push("sprint:complete");
        }

        if (p.userStory) {
            if (p.userStory.create) keys.push("userStory:create");
            if (p.userStory.view.all) keys.push("userStory:view:all");
            if (p.userStory.update) keys.push("userStory:update");
            if (p.userStory.assign) keys.push("userStory:assign");
        }

        if (p.team) {
            if (p.team.view.team) keys.push("team:view:team");
            if (p.team.view.all) keys.push("team:view:all");
            if (p.team.performance.team) keys.push("team:performance:team");
            if (p.team.performance.all) keys.push("team:performance:all");
        }

        return keys;
    }


    static toStructured(keys: string[]): EmployeePermissionsDTO {
        const p: EmployeePermissionsDTO = {
            project: { create: false, view: { team: false, all: false }, update: { team: false, all: false }, delete: false },
            task: { create: false, view: { team: false, all: false }, assign: { team: false, all: false }, update: { team: false, all: false } },
            sprint: { create: false, view: { all: false }, update: false, start: false, complete: false },
            userStory: { create: false, view: { all: false }, update: false, assign: false },
            team: { view: { team: false, all: false }, performance: { team: false, all: false } }
        };

        keys.forEach(key => {
            const [moduleName, action, scope] = key.split(':') as [keyof EmployeePermissionsDTO, string, string?];

            if (p[moduleName] && action) {
                const module = p[moduleName] as unknown as Record<string, boolean | Record<string, boolean>>;
                if (scope) {
                    const actionObj = module[action];
                    if (actionObj && typeof actionObj === 'object') {
                        (actionObj as Record<string, boolean>)[scope] = true;
                    }
                } else {
                    module[action] = true;
                }
            }
        });

        return p;
    }
}
