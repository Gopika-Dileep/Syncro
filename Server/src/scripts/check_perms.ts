import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkPermissions() {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) throw new Error('MONGO_URI not found');
        await mongoose.connect(mongoUri);
        const db = mongoose.connection.db;
        if (!db) throw new Error('DB not found');
        const definitions = await db.collection('permissiondefinitions').find({}).toArray();
        console.log('Total definitions:', definitions.length);
        const blockPerms = definitions.filter(d => d.permission_key.includes('block'));
        console.log('Block permissions found:', blockPerms.map(d => d.permission_key));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkPermissions();
