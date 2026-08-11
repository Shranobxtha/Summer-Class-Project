const productsBody = document.getElementById('productsBody');
const productsTable = document.getElementById('productsTable');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const supplierFilter = document.getElementById('supplierFilter');

let debounceTimer = null;

// Load the supplier dropdown once, used for filtering
async function loadSupplierFilter() {
  try {
    const suppliers = await apiRequest('/suppliers');
    suppliers.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.name;
      supplierFilter.appendChild(opt);
    });
  } catch (err) {
    console.error('Could not load suppliers for filter:', err.message);
  }
}

// Builds the query string from whatever search/filter is currently set, then fetches and renders
async function loadProducts() {
  const params = new URLSearchParams();
  if (searchInput.value.trim()) params.set('search', searchInput.value.trim());
  if (supplierFilter.value) params.set('supplierId', supplierFilter.value);

  try {
    const products = await apiRequest(`/products?${params.toString()}`);
    renderProducts(products);
  } catch (err) {
    productsBody.innerHTML = `<tr><td colspan="6">Could not load products: ${escapeHtml(err.message)}</td></tr>`;
    productsTable.style.display = '';
    emptyState.style.display = 'none';
  }
}

function renderProducts(products) {
  if (products.length === 0) {
    productsTable.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  productsTable.style.display = '';
  emptyState.style.display = 'none';

  productsBody.innerHTML = products
    .map((p) => {
      const thumb = p.imageUrl
        ? `<img class="thumb" src="${SERVER_BASE}${p.imageUrl}" alt="${escapeHtml(p.name)}" />`
        : `<div class="thumb-placeholder">N/A</div>`;

      const qtyClass = p.lowStock ? 'qty-badge qty-low' : 'qty-badge';
      const lowTag = p.lowStock ? '<span class="low-tag">Low stock</span>' : '';

      return `
        <tr>
          <td>${thumb}</td>
          <td class="product-name"><a href="product-detail.html?id=${p.id}">${escapeHtml(p.name)}</a></td>
          <td>$${Number(p.price).toFixed(2)}</td>
          <td><span class="${qtyClass}">${p.quantity}</span>${lowTag}</td>
          <td>${p.Supplier ? escapeHtml(p.Supplier.name) : '—'}</td>
          <td>
            <div class="row-actions">
              <a href="product-form.html?id=${p.id}">Edit</a>
              <button class="del-btn" data-id="${p.id}" data-name="${escapeHtml(p.name)}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  // Wire up delete buttons after rendering (they don't exist until now)
  document.querySelectorAll('.del-btn').forEach((btn) => {
    btn.addEventListener('click', () => handleDelete(btn.dataset.id, btn.dataset.name));
  });
}

async function handleDelete(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

  try {
    await apiRequest(`/products/${id}`, { method: 'DELETE' });
    loadProducts();
  } catch (err) {
    alert(`Could not delete product: ${err.message}`);
  }
}

// Prevents basic HTML injection when displaying product names (defense in depth on the frontend)
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Search-as-you-type, but debounced so it doesn't fire an API call on every single keystroke
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadProducts, 350);
});
supplierFilter.addEventListener('change', loadProducts);

loadSupplierFilter();
loadProducts();
