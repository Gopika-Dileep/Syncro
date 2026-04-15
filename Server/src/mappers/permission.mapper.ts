import { EmployeePermissionsDTO } from '../dto/employee.dto';

type NestedPermission = { [key: string]: boolean | NestedPermission };

export class PermissionMapper {
  static toFlatKeys(p: Partial<EmployeePermissionsDTO>): string[] {
    const keys: string[] = [];

    if (p.project) {
      if (p.project.create) keys.push('project:create');
      if (p.project.view.all) keys.push('project:view:all');
      if (p.project.update.own) keys.push('project:update');
      if (p.project.update.all) keys.push('project:update:all');
      if (p.project.delete.own) keys.push('project:delete');
      if (p.project.delete.all) keys.push('project:delete:all');
    }

    if (p.task) {
      if (p.task.create) keys.push('task:create');
      if (p.task.view.team) keys.push('task:view:team');
      if (p.task.view.all) keys.push('task:view:all');
      if (p.task.assign) keys.push('task:assign');
      if (p.task.update.own) keys.push('task:update');
      if (p.task.update.all) keys.push('task:update:all');
    }

    if (p.sprint) {
      if (p.sprint.create) keys.push('sprint:create');
      if (p.sprint.view.all) keys.push('sprint:view:all');
      if (p.sprint.update.own) keys.push('sprint:update');
      if (p.sprint.update.all) keys.push('sprint:update:all');
      if (p.sprint.delete?.own) keys.push('sprint:delete');
      if (p.sprint.delete?.all) keys.push('sprint:delete:all');
      if (p.sprint.start) keys.push('sprint:start');
      if (p.sprint.complete) keys.push('sprint:complete');
    }

    if (p.userStory) {
      if (p.userStory.create) keys.push('userStory:create');
      if (p.userStory.view.all) keys.push('userStory:view:all');
      if (p.userStory.update.own) keys.push('userStory:update');
      if (p.userStory.update.all) keys.push('userStory:update:all');
      if (p.userStory.delete?.own) keys.push('userStory:delete');
      if (p.userStory.delete?.all) keys.push('userStory:delete:all');
      if (p.userStory.assign) keys.push('userStory:assign');
    }

    if (p.team) {
      if (p.team.view.team) keys.push('team:view:team');
      if (p.team.view.all) keys.push('team:view:all');
    }

    return keys;
  }

  static toStructured(keys: string[]): EmployeePermissionsDTO {
    const p: EmployeePermissionsDTO = {
      project: { create: false, view: { all: false }, update: { own: false, all: false }, delete: { own: false, all: false } },
      task: { create: false, view: { team: false, all: false }, assign: false, update: { own: false, all: false } },
      sprint: { create: false, view: { all: false }, update: { own: false, all: false }, delete: { own: false, all: false }, start: false, complete: false },
      userStory: { create: false, view: { all: false }, update: { own: false, all: false }, delete: { own: false, all: false }, assign: false },
      team: { view: { team: false, all: false } },
    };

    keys.forEach((key) => {
      const parts = key.split(':');
      const moduleName = parts[0] as keyof EmployeePermissionsDTO;
      const action = parts[1];
      const scope = parts[2];

      if (p[moduleName] && action) {
        const module = p[moduleName] as unknown as NestedPermission;
        if (!scope) {
          const field = module[action];
          if (typeof field === 'boolean') {
            module[action] = true;
          } else if (typeof field === 'object' && field !== null) {
            (field as NestedPermission)['own'] = true;
          }
        } else {
          const field = module[action];
          if (typeof field === 'object' && field !== null) {
            (field as NestedPermission)[scope] = true;
          }
        }
      }
    });

    return p;
  }
}
