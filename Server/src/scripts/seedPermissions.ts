import mongoose from 'mongoose';
import { permissionDefinitionModel } from '../models/permissionDefinition.model';
import dotenv from 'dotenv';
dotenv.config();

const permissions = [
  // MODULE: project
  { module: 'project', action: 'create', scope: 'any', permission_key: 'project:create' },
  { module: 'project', action: 'view', scope: 'team', permission_key: 'project:view:team' },
  { module: 'project', action: 'view', scope: 'all', permission_key: 'project:view:all' },
  { module: 'project', action: 'update', scope: 'team', permission_key: 'project:update:team' },
  { module: 'project', action: 'update', scope: 'all', permission_key: 'project:update:all' },
  { module: 'project', action: 'delete', scope: 'any', permission_key: 'project:delete' },

  // MODULE: task
  { module: 'task', action: 'create', scope: 'any', permission_key: 'task:create' },
  { module: 'task', action: 'view', scope: 'team', permission_key: 'task:view:team' },
  { module: 'task', action: 'view', scope: 'all', permission_key: 'task:view:all' },
  { module: 'task', action: 'assign', scope: 'team', permission_key: 'task:assign:team' },
  { module: 'task', action: 'assign', scope: 'all', permission_key: 'task:assign:all' },
  { module: 'task', action: 'update', scope: 'team', permission_key: 'task:update:team' },
  { module: 'task', action: 'update', scope: 'all', permission_key: 'task:update:all' },

  // MODULE: sprint
  { module: 'sprint', action: 'create', scope: 'any', permission_key: 'sprint:create' },
  { module: 'sprint', action: 'view', scope: 'all', permission_key: 'sprint:view:all' },
  { module: 'sprint', action: 'update', scope: 'any', permission_key: 'sprint:update' },
  { module: 'sprint', action: 'start', scope: 'any', permission_key: 'sprint:start' },
  { module: 'sprint', action: 'complete', scope: 'any', permission_key: 'sprint:complete' },

  // MODULE: userStory
  { module: 'userStory', action: 'create', scope: 'any', permission_key: 'userStory:create' },
  { module: 'userStory', action: 'view', scope: 'all', permission_key: 'userStory:view:all' },
  { module: 'userStory', action: 'update', scope: 'any', permission_key: 'userStory:update' },
  { module: 'userStory', action: 'assign', scope: 'any', permission_key: 'userStory:assign' },

  // MODULE: team
  { module: 'team', action: 'view', scope: 'team', permission_key: 'team:view:team' },
  { module: 'team', action: 'view', scope: 'all', permission_key: 'team:view:all' },
  { module: 'team', action: 'performance', scope: 'team', permission_key: 'team:performance:team' },
  { module: 'team', action: 'performance', scope: 'all', permission_key: 'team:performance:all' },
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
