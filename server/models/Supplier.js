const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// A Supplier is a company that provides products.
// One Supplier can supply MANY Products (we set up that relationship in models/index.js)
const Supplier = sequelize.define('Supplier', {
  name: {
    type: DataTypes.STRING,
    allowNull: false, // NOT NULL constraint
    validate: {
      notEmpty: { msg: 'Supplier name is required' },
    },
  },
  contactEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Contact email is required' },
      isEmail: { msg: 'Contact email must be a valid email address' },
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Phone number is required' },
    },
  },
});

module.exports = Supplier;
