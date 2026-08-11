const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

// Every route requires login - viewing inventory data is also protected per the spec
router.get('/', requireAuth, getAllProducts);
router.get('/:id', requireAuth, getProductById);
router.post('/', requireAuth, upload.single('image'), createProduct);
router.put('/:id', requireAuth, upload.single('image'), updateProduct);
router.delete('/:id', requireAuth, deleteProduct);

module.exports = router;
