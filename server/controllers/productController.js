const { Op } = require('sequelize');
const { Product, Supplier } = require('../models');

const LOW_STOCK_THRESHOLD = 5; // change this one number to adjust the low-stock alert everywhere

// GET /api/products?search=scarf&supplierId=2
// Supports searching by name AND filtering by supplier, at the same time or separately
async function getAllProducts(req, res) {
  const { search, supplierId } = req.query;
  const where = {};

  if (search) {
    where.name = { [Op.like]: `%${search}%` }; // case-insensitive-ish partial match
  }
  if (supplierId) {
    where.supplierId = supplierId;
  }

  const products = await Product.findAll({
    where,
    include: Supplier, // always include supplier name, never just the raw ID
    order: [['name', 'ASC']],
  });

  // Add a simple computed flag the frontend can use to highlight low stock in red
  const productsWithFlag = products.map((p) => ({
    ...p.toJSON(),
    lowStock: p.quantity < LOW_STOCK_THRESHOLD,
  }));

  res.json(productsWithFlag);
}

// GET /api/products/:id
async function getProductById(req, res) {
  const product = await Product.findByPk(req.params.id, { include: Supplier });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ ...product.toJSON(), lowStock: product.quantity < LOW_STOCK_THRESHOLD });
}

// POST /api/products  (protected - admin only, accepts multipart/form-data with an image file)
async function createProduct(req, res) {
  try {
    const { name, description, price, quantity, supplierId } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      quantity,
      supplierId,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });

    res.status(201).json(product);
  } catch (err) {
    handleValidationError(err, res);
  }
}

// PUT /api/products/:id  (protected - admin only)
async function updateProduct(req, res) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const { name, description, price, quantity, supplierId } = req.body;
    const updates = { name, description, price, quantity, supplierId };

    // Only replace the image if a new one was actually uploaded, otherwise keep the old one
    if (req.file) {
      updates.imageUrl = `/uploads/${req.file.filename}`;
    }

    await product.update(updates);
    res.json(product);
  } catch (err) {
    handleValidationError(err, res);
  }
}

// DELETE /api/products/:id  (protected - admin only)
async function deleteProduct(req, res) {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  await product.destroy();
  res.json({ message: 'Product deleted' });
}

function handleValidationError(err, res) {
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
}

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
