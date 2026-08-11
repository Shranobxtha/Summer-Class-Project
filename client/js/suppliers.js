const suppliersBody = document.getElementById('suppliersBody');
const suppliersTable = document.getElementById('suppliersTable');
const emptyState = document.getElementById('emptyState');

async function loadSuppliers() {
  try {
    const suppliers = await apiRequest('/suppliers');
    renderSuppliers(suppliers);
  } catch (err) {
    suppliersBody.innerHTML = `<tr><td colspan="4">Could not load suppliers: ${escapeHtml(err.message)}</td></tr>`;
    suppliersTable.style.display = '';
    emptyState.style.display = 'none';
  }
}

function renderSuppliers(suppliers) {
  if (suppliers.length === 0) {
    suppliersTable.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  suppliersTable.style.display = '';
  emptyState.style.display = 'none';

  suppliersBody.innerHTML = suppliers
    .map(
      (s) => `
        <tr>
          <td class="product-name">${escapeHtml(s.name)}</td>
          <td>${escapeHtml(s.contactEmail)}</td>
          <td>${escapeHtml(s.phone)}</td>
          <td>
            <div class="row-actions">
              <a href="supplier-form.html?id=${s.id}">Edit</a>
              <button class="del-btn" data-id="${s.id}" data-name="${escapeHtml(s.name)}">Delete</button>
            </div>
          </td>
        </tr>
      `
    )
    .join('');

  document.querySelectorAll('.del-btn').forEach((btn) => {
    btn.addEventListener('click', () => handleDelete(btn.dataset.id, btn.dataset.name));
  });
}

async function handleDelete(id, name) {
  // Deleting a supplier also deletes all of its products (the server cascades this),
  // so the confirm message needs to make that clear before it happens.
  const confirmed = confirm(
    `Delete "${name}"? This will also delete every product linked to this supplier. This cannot be undone.`
  );
  if (!confirmed) return;

  try {
    await apiRequest(`/suppliers/${id}`, { method: 'DELETE' });
    loadSuppliers();
  } catch (err) {
    alert(`Could not delete supplier: ${err.message}`);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

loadSuppliers();
