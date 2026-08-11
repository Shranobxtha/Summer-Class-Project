// Same add/edit pattern as product-form.js: "?id=" in the URL means we're editing.
const params = new URLSearchParams(window.location.search);
const supplierId = params.get('id');
const isEditMode = !!supplierId;

const form = document.getElementById('supplierForm');
const formError = document.getElementById('formError');
const submitBtn = document.getElementById('submitBtn');
const formHeading = document.getElementById('formHeading');

const nameField = document.getElementById('nameField');
const nameInput = document.getElementById('name');
const emailField = document.getElementById('emailField');
const emailInput = document.getElementById('email');
const phoneField = document.getElementById('phoneField');
const phoneInput = document.getElementById('phone');

if (isEditMode) {
  formHeading.textContent = 'Edit supplier';
  submitBtn.textContent = 'Save changes';
  document.getElementById('pageTitle').textContent = 'Edit Supplier · GODAM';

  // Prefill the form with the existing supplier's details
  apiRequest(`/suppliers/${supplierId}`)
    .then((supplier) => {
      nameInput.value = supplier.name;
      emailInput.value = supplier.contactEmail;
      phoneInput.value = supplier.phone;
    })
    .catch((err) => {
      formError.textContent = `Could not load supplier: ${err.message}`;
      formError.classList.add('show');
    });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.classList.remove('show');

  // Same rules as the inline "+ Add new supplier" box on product-form.html - shared in supplier-fields.js
  const supplierData = validateSupplierFields({
    nameInput,
    emailInput,
    phoneInput,
    nameField,
    emailField,
    phoneField,
  });
  if (!supplierData) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    if (isEditMode) {
      await apiRequest(`/suppliers/${supplierId}`, { method: 'PUT', body: supplierData });
    } else {
      await apiRequest('/suppliers', { method: 'POST', body: supplierData });
    }
    window.location.href = 'suppliers.html';
  } catch (err) {
    formError.textContent = err.message;
    formError.classList.add('show');
    submitBtn.disabled = false;
    submitBtn.textContent = isEditMode ? 'Save changes' : 'Save supplier';
  }
});
