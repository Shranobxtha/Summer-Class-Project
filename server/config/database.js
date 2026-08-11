// This file just sets up ONE connection to our SQLite database file.
// Every model (Product, Supplier, User) will import this same connection.

const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'), // the actual .sqlite file lives in /server
  logging: false, // set to console.log if you want to see every SQL query Sequelize runs
});

module.exports = sequelize;
