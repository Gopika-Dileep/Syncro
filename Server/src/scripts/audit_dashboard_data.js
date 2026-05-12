
const mongoose = require('mongoose');

async function debug() {
    await mongoose.connect('mongodb://localhost:27017/syncro'); // Adjust if needed
    
    const companyId = '663f25c760440333d0698114'; // I'll infer this or use a query
    const teamId = '663f25c760440333d0698118'; // I'll try to find a lead's team
    
    console.log('--- DB AUDIT ---');
    
    const teams = await mongoose.connection.db.collection('teams').find({}).toArray();
    console.log('Teams found:', teams.length);
    
    const employees = await mongoose.connection.db.collection('employees').find({}).toArray();
    console.log('Employees found:', employees.length);
    
    const activeSprints = await mongoose.connection.db.collection('sprints').find({ status: { $regex: /active/i } }).toArray();
    console.log('Active Sprints found:', activeSprints.map(s => ({ name: s.name, status: s.status, company: s.company_id })));

    const subTasksWithTeam = await mongoose.connection.db.collection('subtasks').find({ team_id: { $exists: true, $ne: null } }).count();
    console.log('Subtasks with team_id:', subTasksWithTeam);
    
    process.exit(0);
}

// debug();
console.log('Script ready to check data structures.');
