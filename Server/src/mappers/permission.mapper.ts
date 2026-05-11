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
      if (p.task.status_work) keys.push('task:status:work');
      if (p.task.status_review) keys.push('task:status:review');
      if (p.task.block) keys.push('task:block');
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
      if (p.issue.story.create) keys.push('issue:story:create');
      if (p.issue.story.view) keys.push('issue:story:view');
      if (p.issue.story.update) keys.push('issue:story:update');
      if (p.issue.story.delete) keys.push('issue:story:delete');
      if (p.issue.story.assign_to_sprint) keys.push('issue:story:assign_to_sprint');
      if (p.issue.story.comment) keys.push('issue:story:comment');
      if (p.issue.story.status_work) keys.push('issue:story:status:work');
      if (p.issue.story.status_review) keys.push('issue:story:status:review');
      if (p.issue.story.block) keys.push('issue:story:block');

      if (p.issue.task.create) keys.push('issue:task:create');
      if (p.issue.task.view) keys.push('issue:task:view');
      if (p.issue.task.update) keys.push('issue:task:update');
      if (p.issue.task.delete) keys.push('issue:task:delete');
      if (p.issue.task.assign) keys.push('issue:task:assign');
      if (p.issue.task.assign_to_sprint) keys.push('issue:task:assign_to_sprint');
      if (p.issue.task.status_work) keys.push('issue:task:status:work');
      if (p.issue.task.status_review) keys.push('issue:task:status:review');
      if (p.issue.task.block) keys.push('issue:task:block');

      if (p.issue.bug.create) keys.push('issue:bug:create');
      if (p.issue.bug.view) keys.push('issue:bug:view');
      if (p.issue.bug.update) keys.push('issue:bug:update');
      if (p.issue.bug.delete) keys.push('issue:bug:delete');
      if (p.issue.bug.assign) keys.push('issue:bug:assign');
      if (p.issue.bug.assign_to_sprint) keys.push('issue:bug:assign_to_sprint');
      if (p.issue.bug.status_work) keys.push('issue:bug:status:work');
      if (p.issue.bug.status_review) keys.push('issue:bug:status:review');
      if (p.issue.bug.block) keys.push('issue:bug:block');
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
      task: { create: false, view: { assigned: false, team: false, all: false }, assign: false, update: false, delete: false, status_work: false, status_review: false, block: false },
      sprint: { create: false, view: { all: false }, update: false, delete: false, addStory: false, start: false, complete: false },
      issue: {
        story: { create: false, view: false, update: false, delete: false, assign_to_sprint: false, comment: false, status_work: false, status_review: false, block: false },
        task: { create: false, view: false, update: false, delete: false, assign: false, assign_to_sprint: false, status_work: false, status_review: false, block: false },
        bug: { create: false, view: false, update: false, delete: false, assign: false, assign_to_sprint: false, status_work: false, status_review: false, block: false },
      },
      team: { view: { team: false, all: false } },
    };

    keys.forEach((key) => {
      const parts = key.split(':');
      if (parts.length < 2) return;

      const moduleName = parts[0];

      if (moduleName === 'project') {
        if (parts[1] === 'create') p.project.create = true;
        if (parts[1] === 'update') p.project.update = true;
        if (parts[1] === 'delete') p.project.delete = true;
        if (parts[1] === 'view') {
          if (parts[2] === 'all') p.project.view.all = true;
          if (parts[2] === 'assigned') p.project.view.assigned = true;
        }
      }

      if (moduleName === 'task') {
        if (parts[1] === 'create') p.task.create = true;
        if (parts[1] === 'assign') p.task.assign = true;
        if (parts[1] === 'update') p.task.update = true;
        if (parts[1] === 'delete') p.task.delete = true;
        if (parts[1] === 'block') p.task.block = true;
        if (parts[1] === 'view') {
          if (parts[2] === 'assigned') p.task.view.assigned = true;
          if (parts[2] === 'team') p.task.view.team = true;
          if (parts[2] === 'all') p.task.view.all = true;
        }
        if (parts[1] === 'status') {
          if (parts[2] === 'work') p.task.status_work = true;
          if (parts[2] === 'review') p.task.status_review = true;
        }
      }

      if (moduleName === 'sprint') {
        if (parts[1] === 'create') p.sprint.create = true;
        if (parts[1] === 'update') p.sprint.update = true;
        if (parts[1] === 'delete') p.sprint.delete = true;
        if (parts[1] === 'addStory') p.sprint.addStory = true;
        if (parts[1] === 'start') p.sprint.start = true;
        if (parts[1] === 'complete') p.sprint.complete = true;
        if (parts[1] === 'view' && parts[2] === 'all') p.sprint.view.all = true;
      }

      if (moduleName === 'issue') {
        const sub = parts[1] as 'story' | 'task' | 'bug';
        if (!p.issue[sub]) return;
        const action = parts[2];

        if (action === 'create') p.issue[sub].create = true;
        if (action === 'view') p.issue[sub].view = true;
        if (action === 'update') p.issue[sub].update = true;
        if (action === 'delete') p.issue[sub].delete = true;
        if (action === 'block') p.issue[sub].block = true;
        if (action === 'assign') {
          if (sub === 'story') p.issue[sub].assign_to_sprint = true;
          else p.issue[sub].assign = true;
        }
        if (action === 'assign_to_sprint') p.issue[sub].assign_to_sprint = true;
        if (action === 'comment' && sub === 'story') p.issue[sub].comment = true;
        if (action === 'status') {
          if (parts[3] === 'work') p.issue[sub].status_work = true;
          if (parts[3] === 'review') p.issue[sub].status_review = true;
        }
      }

      if (moduleName === 'team') {
        if (parts[1] === 'view') {
          if (parts[2] === 'team') p.team.view.team = true;
          if (parts[2] === 'all') p.team.view.all = true;
        }
      }
    });

    return p;
  }
}
