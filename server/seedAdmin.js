require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

// Run this once with: node seedAdmin.js
// Creates a single admin login: username "admin", password "admin123"
// Change these values before you actually deploy if you want something less obvious.
async function seedAdmin() {
  await sequelize.sync();

  const existing = await User.findOne({ where: { username: 'admin' } });
  if (existing) {
    console.log('Admin user already exists, skipping.');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash('admin123', 10); // 10 = hashing "cost" - never store plain text
  await User.create({ username: 'admin', password: hashedPassword });

  console.log('Admin user created: username=admin, password=admin123');
  process.exit(0);
}

seedAdmin();
