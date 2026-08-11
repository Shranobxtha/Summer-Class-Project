const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplierController');

// The spec requires ALL inventory data - including just viewing it - to be behind login.
// So every route here uses requireAuth, not just the write ones.
router.get('/', requireAuth, getAllSuppliers);
router.get('/:id', requireAuth, getSupplierById);
router.post('/', requireAuth, createSupplier);
router.put('/:id', requireAuth, updateSupplier);
router.delete('/:id', requireAuth, deleteSupplier);

module.exports = router;
