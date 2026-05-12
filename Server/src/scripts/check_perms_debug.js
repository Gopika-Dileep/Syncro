const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/syncro').then(async () => {
  const db = mongoose.connection.db;
  const ids = ['69e8a8f227ca04befa038eca', '69df528617415c7f9a65384b'];
  
  for (const id of ids) {
    const emp = await db.collection('employees').findOne({ _id: new mongoose.Types.ObjectId(id) });
    if (emp) {
      const permsDoc = await db.collection('permissions').findOne({ user_id: emp.user_id });
      if (permsDoc) {
        const defs = await db.collection('permissiondefinitions').find({ _id: { $in: permsDoc.permissions } }).toArray();
        console.log(`User ${id} Perms:`, defs.map(d => d.permission_key));
      } else {
        console.log(`User ${id} has no permissions document`);
      }
    } else {
      console.log(`User ${id} not found in employees`);
    }
  }
  process.exit(0);
});
