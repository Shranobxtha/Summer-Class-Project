const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// This is the ADMIN account table. It is completely separate from Products/Suppliers.
// We NEVER store the plain text password - only a bcrypt hash of it (see controllers/authController.js)
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // no two users can have the same username
    validate: {
      notEmpty: { msg: 'Username is required' },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false, // this column actually holds the HASH, not the real password
  },
});

module.exports = User;
