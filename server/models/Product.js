const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// A Product belongs to ONE Supplier (foreign key: supplierId)
const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Product name is required' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true, // description can be blank, it's not critical data
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Price cannot be negative' },
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'Quantity cannot be negative' },
    },
  },
  imageUrl: {
    type: DataTypes.STRING, // stores the path to the uploaded image file, e.g. /uploads/abc123.jpg
    allowNull: true,
  },
  // supplierId foreign key is added automatically by the association in models/index.js
});

module.exports = Product;
