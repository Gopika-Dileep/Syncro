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

  // MODULE: issue (Story, Bug, Task)
  { module: 'issue', action: 'create', scope: 'any', permission_key: 'issue:create' },
  { module: 'issue', action: 'view', scope: 'all', permission_key: 'issue:view:all' },
  { module: 'issue', action: 'update', scope: 'any', permission_key: 'issue:update' },
  { module: 'issue', action: 'delete', scope: 'any', permission_key: 'issue:delete' },
  { module: 'issue', action: 'assign', scope: 'any', permission_key: 'issue:assign' },
  { module: 'issue', action: 'assignEmployee', scope: 'any', permission_key: 'issue:assignEmployee' },
  { module: 'issue', action: 'comment', scope: 'any', permission_key: 'issue:comment' },

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
  { module: 'task', action: 'start', scope: 'any', permission_key: 'task:start' },
  { module: 'task', action: 'submit', scope: 'any', permission_key: 'task:submit' },
  { module: 'task', action: 'review', scope: 'any', permission_key: 'task:review' },

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
      await permissionDefinitionModel.findOneAndUpdate(
        { permission_key: p.permission_key },
        { $set: p },
        { upsert: true, new: true }
      );
    }

    console.log(`Successfully synced ${permissions.length} granular permissions.`);
    process.exit(0);
  } catch (error: unknown) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
