import mongoose from 'mongoose';
import { permissionDefinitionModel } from '../models/permissionDefinition.model';
import dotenv from 'dotenv';
dotenv.config();

const permissions = [
  // MODULE: project
  { module: 'project', action: 'create', scope: 'any', permission_key: 'project:create' },
  { module: 'project', action: 'view', scope: 'all', permission_key: 'project:view:all' },
  { module: 'project', action: 'update', scope: 'any', permission_key: 'project:update' },
  { module: 'project', action: 'update', scope: 'all', permission_key: 'project:update:all' },
  { module: 'project', action: 'delete', scope: 'any', permission_key: 'project:delete' },
  { module: 'project', action: 'delete', scope: 'all', permission_key: 'project:delete:all' },

  // MODULE: userStory
  { module: 'userStory', action: 'create', scope: 'any', permission_key: 'userStory:create' },
  { module: 'userStory', action: 'view', scope: 'all', permission_key: 'userStory:view:all' },
  { module: 'userStory', action: 'update', scope: 'any', permission_key: 'userStory:update' },
  { module: 'userStory', action: 'update', scope: 'all', permission_key: 'userStory:update:all' },
  { module: 'userStory', action: 'assign', scope: 'any', permission_key: 'userStory:assign' },

  // MODULE: sprint
  { module: 'sprint', action: 'create', scope: 'any', permission_key: 'sprint:create' },
  { module: 'sprint', action: 'view', scope: 'all', permission_key: 'sprint:view:all' },
  { module: 'sprint', action: 'update', scope: 'any', permission_key: 'sprint:update' },
  { module: 'sprint', action: 'update', scope: 'all', permission_key: 'sprint:update:all' },
  { module: 'sprint', action: 'start', scope: 'any', permission_key: 'sprint:start' },
  { module: 'sprint', action: 'complete', scope: 'any', permission_key: 'sprint:complete' },

  // MODULE: task
  { module: 'task', action: 'create', scope: 'any', permission_key: 'task:create' },
  { module: 'task', action: 'view', scope: 'team', permission_key: 'task:view:team' },
  { module: 'task', action: 'view', scope: 'all', permission_key: 'task:view:all' },
  { module: 'task', action: 'assign', scope: 'any', permission_key: 'task:assign' },
  { module: 'task', action: 'update', scope: 'any', permission_key: 'task:update' },
  { module: 'task', action: 'update', scope: 'all', permission_key: 'task:update:all' },

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

    await permissionDefinitionModel.deleteMany({});
    await permissionDefinitionModel.insertMany(permissions);

    console.log(`Successfully seeded ${permissions.length} granular permissions.`);
    process.exit(0);
  } catch (error: unknown) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
