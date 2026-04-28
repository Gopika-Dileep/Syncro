import { EmployeePermissionsDTO } from '../dto/employee.dto';

export class PermissionMapper {
  static toFlatKeys(p: Partial<EmployeePermissionsDTO>): string[] {
    const keys: string[] = [];

    if (p.project) {
      if (p.project.create) keys.push('project:create');
      if (p.project.view.all) keys.push('project:view:all');
      if (p.project.view.assigned) keys.push('project:view:assigned');
      if (p.project.update) keys.push('project:update');
      if (p.project.delete) keys.push('project:delete');
    }

    if (p.task) {
      if (p.task.create) keys.push('task:create');
      if (p.task.view.assigned) keys.push('task:view:assigned');
      if (p.task.view.team) keys.push('task:view:team');
      if (p.task.view.all) keys.push('task:view:all');
      if (p.task.assign) keys.push('task:assign');
      if (p.task.update) keys.push('task:update');
      if (p.task.delete) keys.push('task:delete');
      if (p.task.start) keys.push('task:start');
      if (p.task.submit) keys.push('task:submit');
      if (p.task.review) keys.push('task:review');
    }

    if (p.sprint) {
      if (p.sprint.create) keys.push('sprint:create');
      if (p.sprint.view.all) keys.push('sprint:view:all');
      if (p.sprint.update) keys.push('sprint:update');
      if (p.sprint.delete) keys.push('sprint:delete');
      if (p.sprint.addStory) keys.push('sprint:addStory');
      if (p.sprint.start) keys.push('sprint:start');
      if (p.sprint.complete) keys.push('sprint:complete');
    }

    if (p.issue) {
      if (p.issue.create) keys.push('issue:create');
      if (p.issue.view.all) keys.push('issue:view:all');
      if (p.issue.update) keys.push('issue:update');
      if (p.issue.delete) keys.push('issue:delete');
      if (p.issue.assign) keys.push('issue:assign');
      if (p.issue.assignEmployee) keys.push('issue:assignEmployee');
      if (p.issue.comment) keys.push('issue:comment');
    }

    if (p.team) {
      if (p.team.view.team) keys.push('team:view:team');
      if (p.team.view.all) keys.push('team:view:all');
    }

    return keys;
  }

  static toStructured(keys: string[]): EmployeePermissionsDTO {
    const p: EmployeePermissionsDTO = {
      project: { create: false, view: { all: false, assigned: false }, update: false, delete: false },
      task: { create: false, view: { assigned: false, team: false, all: false }, assign: false, update: false, delete: false, start: false, submit: false, review: false },
      sprint: { create: false, view: { all: false }, update: false, delete: false, addStory: false, start: false, complete: false },
      issue: { create: false, view: { all: false }, update: false, delete: false, assign: false, assignEmployee: false, comment: false },
      team: { view: { team: false, all: false } },
    };

    keys.forEach((key) => {
      const parts = key.split(':');
      const moduleName = parts[0] as keyof EmployeePermissionsDTO;
      const action = parts[1];
      const scope = parts[2];

      if (p[moduleName] && action) {
        const module = p[moduleName] as Record<string, unknown>;
        if (!scope) {
          module[action] = true;
        } else {
          if (module[action] && typeof module[action] === 'object') {
            (module[action] as Record<string, unknown>)[scope] = true;
          }
        }
      }
    });

    return p;
  }
}
