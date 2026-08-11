const { Supplier, Product } = require('../models');

// GET /api/suppliers
async function getAllSuppliers(req, res) {
  const suppliers = await Supplier.findAll({ order: [['name', 'ASC']] });
  res.json(suppliers);
}

// GET /api/suppliers/:id
async function getSupplierById(req, res) {
  const supplier = await Supplier.findByPk(req.params.id);
  if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
  res.json(supplier);
}

// POST /api/suppliers  (protected - admin only)
async function createSupplier(req, res) {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (err) {
    handleValidationError(err, res);
  }
}

// PUT /api/suppliers/:id  (protected - admin only)
async function updateSupplier(req, res) {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    await supplier.update(req.body);
    res.json(supplier);
  } catch (err) {
    handleValidationError(err, res);
  }
}

// DELETE /api/suppliers/:id  (protected - admin only)
async function deleteSupplier(req, res) {
  const supplier = await Supplier.findByPk(req.params.id);
  if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
  await supplier.destroy(); // also deletes their products, because of onDelete: 'CASCADE'
  res.json({ message: 'Supplier deleted' });
}

// Turns a Sequelize validation error into a clean, specific error message for the frontend
function handleValidationError(err, res) {
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }
  res.status(500).json({ error: 'Something went wrong' });
}

module.exports = { getAllSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier };
