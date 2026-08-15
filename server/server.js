require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const seedData = require('./seedData');

const authRoutes = require('./routes/authRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(cors()); // allows the frontend (different port) to talk to this API
app.use(express.json()); // lets us read JSON request bodies
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // serves uploaded images as plain URLs

// Routes - notice how each resource gets its own base path, standard REST style
app.use('/api/auth', authRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);

// Catch-all error handler - so a crash never sends back a raw stack trace to the frontend
app.use((err, req, res, next) => {
  console.error(err);
  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Server error, please try again' });
});

const PORT = process.env.PORT || 5000;

// Check this at startup, not just when someone tries to log in - a missing/empty
// JWT_SECRET would otherwise crash silently on the first login attempt with a
// generic 500, which is exactly what happened during deployment.
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Add it in your environment variables (Render: Environment tab).');
  process.exit(1);
}

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // creates tables if they don't exist yet - keeps existing data
    console.log('Database connected and synced');

    try {
      await seedData();
    } catch (seedErr) {
      // Don't let a seeding problem take down the whole server - just log it and carry on
      console.error('Data seeding failed:', seedErr);
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

start();
