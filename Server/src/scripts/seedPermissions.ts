import mongoose from 'mongoose';
import { permissionDefinitionModel } from '../models/permissionDefinition.model';
import dotenv from 'dotenv';
dotenv.config();

const permissions = [
  // MODULE: project
  { module: 'project', action: 'create', scope: 'any', permission_key: 'project:create' },
  { module: 'project', action: 'view', scope: 'all', permission_key: 'project:view:all' },
  { module: 'project', action: 'view', scope: 'assigned', permission_key: 'project:view:assigned' },
  { module: 'project', action: 'update', scope: 'any', permission_key: 'project:update' },
  { module: 'project', action: 'delete', scope: 'any', permission_key: 'project:delete' },

  // MODULE: issue (Story, Task, Bug)
  // STORY
  { module: 'issue', action: 'story', scope: 'create', permission_key: 'issue:story:create' },
  { module: 'issue', action: 'story', scope: 'view', permission_key: 'issue:story:view' },
  { module: 'issue', action: 'story', scope: 'update', permission_key: 'issue:story:update' },
  { module: 'issue', action: 'story', scope: 'delete', permission_key: 'issue:story:delete' },
  { module: 'issue', action: 'story', scope: 'assign_to_sprint', permission_key: 'issue:story:assign_to_sprint' },
  { module: 'issue', action: 'story', scope: 'comment', permission_key: 'issue:story:comment' },
  { module: 'issue', action: 'story', scope: 'status:work', permission_key: 'issue:story:status:work' },
  { module: 'issue', action: 'story', scope: 'status:review', permission_key: 'issue:story:status:review' },
  { module: 'issue', action: 'story', scope: 'block', permission_key: 'issue:story:block' },

  // TASK
  { module: 'issue', action: 'task', scope: 'create', permission_key: 'issue:task:create' },
  { module: 'issue', action: 'task', scope: 'view', permission_key: 'issue:task:view' },
  { module: 'issue', action: 'task', scope: 'update', permission_key: 'issue:task:update' },
  { module: 'issue', action: 'task', scope: 'delete', permission_key: 'issue:task:delete' },
  { module: 'issue', action: 'task', scope: 'assign', permission_key: 'issue:task:assign' },
  { module: 'issue', action: 'task', scope: 'assign_to_sprint', permission_key: 'issue:task:assign_to_sprint' },
  { module: 'issue', action: 'task', scope: 'status:work', permission_key: 'issue:task:status:work' },
  { module: 'issue', action: 'task', scope: 'status:review', permission_key: 'issue:task:status:review' },
  { module: 'issue', action: 'task', scope: 'block', permission_key: 'issue:task:block' },

  // BUG
  { module: 'issue', action: 'bug', scope: 'create', permission_key: 'issue:bug:create' },
  { module: 'issue', action: 'bug', scope: 'view', permission_key: 'issue:bug:view' },
  { module: 'issue', action: 'bug', scope: 'update', permission_key: 'issue:bug:update' },
  { module: 'issue', action: 'bug', scope: 'delete', permission_key: 'issue:bug:delete' },
  { module: 'issue', action: 'bug', scope: 'assign', permission_key: 'issue:bug:assign' },
  { module: 'issue', action: 'bug', scope: 'assign_to_sprint', permission_key: 'issue:bug:assign_to_sprint' },
  { module: 'issue', action: 'bug', scope: 'status:work', permission_key: 'issue:bug:status:work' },
  { module: 'issue', action: 'bug', scope: 'status:review', permission_key: 'issue:bug:status:review' },
  { module: 'issue', action: 'bug', scope: 'block', permission_key: 'issue:bug:block' },

  // MODULE: sprint
  { module: 'sprint', action: 'create', scope: 'any', permission_key: 'sprint:create' },
  { module: 'sprint', action: 'view', scope: 'all', permission_key: 'sprint:view:all' },
  { module: 'sprint', action: 'addStory', scope: 'any', permission_key: 'sprint:addStory' },
  { module: 'sprint', action: 'update', scope: 'any', permission_key: 'sprint:update' },
  { module: 'sprint', action: 'start', scope: 'any', permission_key: 'sprint:start' },
  { module: 'sprint', action: 'complete', scope: 'any', permission_key: 'sprint:complete' },
  { module: 'sprint', action: 'delete', scope: 'any', permission_key: 'sprint:delete' },

  // MODULE: task (Sub-task)
  { module: 'task', action: 'create', scope: 'any', permission_key: 'task:create' },
  { module: 'task', action: 'view', scope: 'assigned', permission_key: 'task:view:assigned' },
  { module: 'task', action: 'view', scope: 'team', permission_key: 'task:view:team' },
  { module: 'task', action: 'view', scope: 'all', permission_key: 'task:view:all' },
  { module: 'task', action: 'assign', scope: 'any', permission_key: 'task:assign' },
  { module: 'task', action: 'update', scope: 'any', permission_key: 'task:update' },
  { module: 'task', action: 'delete', scope: 'any', permission_key: 'task:delete' },
  { module: 'task', action: 'status:work', scope: 'any', permission_key: 'task:status:work' },
  { module: 'task', action: 'status:review', scope: 'any', permission_key: 'task:status:review' },
  { module: 'task', action: 'block', scope: 'any', permission_key: 'task:block' },

  // MODULE: team
  { module: 'team', action: 'view', scope: 'team', permission_key: 'team:view:team' },
  { module: 'team', action: 'view', scope: 'all', permission_key: 'team:view:all' },
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI not found');

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for permission seeding...');

    for (const p of permissions) {
      await permissionDefinitionModel.findOneAndUpdate({ permission_key: p.permission_key }, { $set: p }, { upsert: true, new: true });
    }

    console.log(`Successfully synced ${permissions.length} granular permissions.`);
    process.exit(0);
  } catch (error: unknown) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
