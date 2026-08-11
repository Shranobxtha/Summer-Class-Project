const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

const loadError = document.getElementById('loadError');
const detailPanel = document.getElementById('detailPanel');
const pageHeading = document.getElementById('pageHeading');

const imagePreview = document.getElementById('imagePreview');
const productName = document.getElementById('productName');
const lowStockTag = document.getElementById('lowStockTag');
const productDescription = document.getElementById('productDescription');
const productPrice = document.getElementById('productPrice');
const productQuantity = document.getElementById('productQuantity');
const supplierCard = document.getElementById('supplierCard');
const editLink = document.getElementById('editLink');
const deleteBtn = document.getElementById('deleteBtn');

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadProduct() {
  if (!productId) {
    showError('No product specified.');
    return;
  }

  try {
    const product = await apiRequest(`/products/${productId}`);
    renderProduct(product);
  } catch (err) {
    showError(`Could not load product: ${err.message}`);
  }
}

function showError(message) {
  loadError.textContent = message;
  loadError.classList.add('show');
  detailPanel.style.display = 'none';
}

function renderProduct(product) {
  document.getElementById('pageTitle').textContent = `${product.name} · GODAM`;
  pageHeading.textContent = product.name;

  if (product.imageUrl) {
    imagePreview.innerHTML = `<img src="${SERVER_BASE}${product.imageUrl}" alt="${escapeHtml(product.name)}" />`;
  }

  productName.textContent = product.name;
  // NOTE: can't just use lowStockTag.hidden here - the .low-tag CSS class sets
  // display:inline-block, which overrides the browser's default [hidden] styling.
  // Setting display directly avoids that clash.
  lowStockTag.style.display = product.lowStock ? 'inline-block' : 'none';

  productDescription.textContent = product.description || 'No description provided.';
  productPrice.textContent = `$${Number(product.price).toFixed(2)}`;
  productQuantity.textContent = product.quantity;

  if (product.Supplier) {
    supplierCard.innerHTML = `
      <div class="supplier-name">${escapeHtml(product.Supplier.name)}</div>
      <div class="supplier-meta">${escapeHtml(product.Supplier.contactEmail)} &middot; ${escapeHtml(product.Supplier.phone)}</div>
    `;
  } else {
    supplierCard.innerHTML = `<span class="meta-label">No supplier assigned</span>`;
  }

  editLink.href = `product-form.html?id=${product.id}`;

  deleteBtn.addEventListener('click', async () => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await apiRequest(`/products/${product.id}`, { method: 'DELETE' });
      window.location.href = 'products.html';
    } catch (err) {
      alert(`Could not delete product: ${err.message}`);
    }
  });

  detailPanel.style.display = 'grid';
}

loadProduct();
