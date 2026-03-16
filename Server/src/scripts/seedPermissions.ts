import mongoose from 'mongoose';
import { permissionDefinitionModel } from '../models/permissionDefinition.model';
import dotenv from 'dotenv';
dotenv.config();

const permissions = [
  // --- 1. PROJECT MANAGEMENT (Primary: Project Manager) ---
  { module: 'project', action: 'view', scope: 'own', permission_key: 'project:view:own' },
  { module: 'project', action: 'view', scope: 'all', permission_key: 'project:view:all' },
  { module: 'project', action: 'create', scope: 'default', permission_key: 'project:create:default' },
  { module: 'project', action: 'update', scope: 'all', permission_key: 'project:update:all' },
  { module: 'project', action: 'delete', scope: 'default', permission_key: 'project:delete:default' },
  // --- 2. PRODUCT BACKLOG & USER STORIES (Primary: PM creating, TL viewing) ---
  { module: 'userStory', action: 'view', scope: 'all', permission_key: 'userStory:view:all' },
  { module: 'userStory', action: 'create', scope: 'default', permission_key: 'userStory:create:default' },
  { module: 'userStory', action: 'update', scope: 'all', permission_key: 'userStory:update:all' },
  { module: 'userStory', action: 'delete', scope: 'default', permission_key: 'userStory:delete:default' },
  { module: 'userStory', action: 'changeStatus', scope: 'default', permission_key: 'userStory:changeStatus:default' },
  // --- 3. SPRINT MANAGEMENT (Primary: PM managing flow) ---
  { module: 'sprint', action: 'view', scope: 'all', permission_key: 'sprint:view:all' },
  { module: 'sprint', action: 'create', scope: 'default', permission_key: 'sprint:create:default' },
  { module: 'sprint', action: 'addUserStories', scope: 'default', permission_key: 'sprint:addUserStories:default' },
  { module: 'sprint', action: 'removeUserStories', scope: 'default', permission_key: 'sprint:removeUserStories:default' },
  { module: 'sprint', action: 'start', scope: 'default', permission_key: 'sprint:start:default' },
  { module: 'sprint', action: 'complete', scope: 'default', permission_key: 'sprint:complete:default' },
  // --- 4. TASK MANAGEMENT (Primary: TL creating/assigning, Developer doing) ---
  { module: 'task', action: 'view', scope: 'own', permission_key: 'task:view:own' },
  { module: 'task', action: 'view', scope: 'team', permission_key: 'task:view:team' },
  { module: 'task', action: 'view', scope: 'all', permission_key: 'task:view:all' },
  { module: 'task', action: 'createFromStory', scope: 'default', permission_key: 'task:createFromStory:default' }, // Specifically for checking TL work
  { module: 'task', action: 'assign', scope: 'default', permission_key: 'task:assign:default' },
  { module: 'task', action: 'update', scope: 'own', permission_key: 'task:update:own' },
  { module: 'task', action: 'update', scope: 'all', permission_key: 'task:update:all' },
  { module: 'task', action: 'changeStatus', scope: 'default', permission_key: 'task:changeStatus:default' },
  { module: 'task', action: 'addComment', scope: 'default', permission_key: 'task:addComment:default' },
  { module: 'task', action: 'addSubtask', scope: 'default', permission_key: 'task:addSubtask:default' }
];
async function seed(){
    try{
        const mongoUri = process.env.MONGO_URI;
        if(!mongoUri) throw new Error("MONGO_URI not found");

        await mongoose.connect(mongoUri);
        console.log("connected to mongodb")

        await permissionDefinitionModel.deleteMany({})
        await permissionDefinitionModel.insertMany(permissions);

        console.log(` seeded ${permissions.length} items`);
        process.exit(0)
    }catch(error){
        console.log("error",error);
        process.exit(1)
    }
}
seed()