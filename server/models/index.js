const sequelize = require('../config/database');
const Product = require('./Product');
const Supplier = require('./Supplier');
const User = require('./User');

// THE RELATIONSHIP: One Supplier has many Products. One Product belongs to one Supplier.
// This automatically adds a "supplierId" foreign key column to the Products table.
Supplier.hasMany(Product, {
  foreignKey: 'supplierId',
  onDelete: 'CASCADE', // if a Supplier is deleted, delete their Products too (prevents orphaned data)
});
Product.belongsTo(Supplier, {
  foreignKey: 'supplierId',
});

module.exports = {
  sequelize,
  Product,
  Supplier,
  User,
};
