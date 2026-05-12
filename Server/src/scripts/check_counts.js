const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/syncro').then(async () => {
  const db = mongoose.connection.db;
  const issues = await db.collection('issues').find({}).toArray();
  const assignedIssues = issues.filter(i => i.assignee_id);
  console.log('Total Issues:', issues.length);
  console.log('Assigned Issues:', assignedIssues.length);
  if (assignedIssues.length > 0) {
    console.log('Sample Assignee ID:', assignedIssues[0].assignee_id);
  }
  
  const subtasks = await db.collection('subtasks').find({}).toArray();
  const assignedSubtasks = subtasks.filter(s => s.assignee_id);
  console.log('Total Subtasks:', subtasks.length);
  console.log('Assigned Subtasks:', assignedSubtasks.length);
  if (assignedSubtasks.length > 0) {
    console.log('Sample Subtask Assignee ID:', assignedSubtasks[0].assignee_id);
  }

  process.exit(0);
});
