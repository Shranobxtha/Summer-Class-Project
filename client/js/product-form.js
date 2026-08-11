// This page is used for BOTH adding a new product and editing an existing one.
// We tell them apart by checking for an "?id=" in the URL. If it's there, we're editing.
const params = new URLSearchParams(window.location.search);
const productId = params.get('id');
const isEditMode = !!productId;

// Grab all the elements we need once, at the top
const form = document.getElementById('productForm');
const formError = document.getElementById('formError');
const submitBtn = document.getElementById('submitBtn');
const formHeading = document.getElementById('formHeading');

const nameField = document.getElementById('nameField');
const nameInput = document.getElementById('name');
const descriptionInput = document.getElementById('description');
const priceField = document.getElementById('priceField');
const priceInput = document.getElementById('price');
const quantityField = document.getElementById('quantityField');
const quantityInput = document.getElementById('quantity');
const supplierField = document.getElementById('supplierField');
const supplierSelect = document.getElementById('supplierSelect');

const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');

// Elements for the inline "add a new supplier without leaving this page" box
const inlineSupplier = document.getElementById('inlineSupplier');
const supplierError = document.getElementById('supplierError');
const newSupplierNameField = document.getElementById('newSupplierNameField');
const newSupplierName = document.getElementById('newSupplierName');
const newSupplierEmailField = document.getElementById('newSupplierEmailField');
const newSupplierEmail = document.getElementById('newSupplierEmail');
const newSupplierPhoneField = document.getElementById('newSupplierPhoneField');
const newSupplierPhone = document.getElementById('newSupplierPhone');
const saveSupplierBtn = document.getElementById('saveSupplierBtn');
const cancelSupplierBtn = document.getElementById('cancelSupplierBtn');

// Remembers what was selected in the dropdown before "+ Add new supplier" was picked,
// so Cancel can put it back the way it was.
let previousSupplierValue = '';

if (isEditMode) {
  formHeading.textContent = 'Edit product';
  submitBtn.textContent = 'Save changes';
  document.getElementById('pageTitle').textContent = 'Edit Product · GODAM';
}

// Adds one <option> to the supplier dropdown, always keeping "+ Add new supplier" as the last item
function addSupplierOption(supplier) {
  const opt = document.createElement('option');
  opt.value = supplier.id;
  opt.textContent = supplier.name;
  const addNewOption = supplierSelect.querySelector('option[value="__new__"]');
  supplierSelect.insertBefore(opt, addNewOption);
  return opt;
}

// Loads every supplier into the dropdown. Returns the list so edit-mode can use it too.
async function loadSuppliers() {
  const suppliers = await apiRequest('/suppliers');
  suppliers.forEach(addSupplierOption);
  return suppliers;
}

// In edit mode, fetches the existing product and fills the form with its current values
async function loadExistingProduct() {
  const product = await apiRequest(`/products/${productId}`);

  nameInput.value = product.name || '';
  descriptionInput.value = product.description || '';
  priceInput.value = product.price;
  quantityInput.value = product.quantity;
  supplierSelect.value = product.supplierId || '';

  if (product.imageUrl) {
    imagePreview.innerHTML = `<img src="${SERVER_BASE}${product.imageUrl}" alt="${product.name}" />`;
  }
}

// Whenever the user picks a new image file, show a live preview of it (not yet uploaded)
imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;
  const objectUrl = URL.createObjectURL(file);
  imagePreview.innerHTML = `<img src="${objectUrl}" alt="Selected image preview" />`;
});

// Switch to the inline supplier form when "+ Add new supplier" is picked
supplierSelect.addEventListener('change', () => {
  if (supplierSelect.value === '__new__') {
    inlineSupplier.hidden = false;
    newSupplierName.focus();
  } else {
    previousSupplierValue = supplierSelect.value;
  }
});

cancelSupplierBtn.addEventListener('click', () => {
  inlineSupplier.hidden = true;
  supplierError.classList.remove('show');
  [newSupplierNameField, newSupplierEmailField, newSupplierPhoneField].forEach((f) => f.classList.remove('has-error'));
  newSupplierName.value = '';
  newSupplierEmail.value = '';
  newSupplierPhone.value = '';
  supplierSelect.value = previousSupplierValue;
});

saveSupplierBtn.addEventListener('click', async () => {
  supplierError.classList.remove('show');

  // Same validation rules as the standalone supplier-form.html page - shared in supplier-fields.js
  const supplierData = validateSupplierFields({
    nameInput: newSupplierName,
    emailInput: newSupplierEmail,
    phoneInput: newSupplierPhone,
    nameField: newSupplierNameField,
    emailField: newSupplierEmailField,
    phoneField: newSupplierPhoneField,
  });
  if (!supplierData) return;

  saveSupplierBtn.disabled = true;
  saveSupplierBtn.textContent = 'Saving...';

  try {
    // The server re-validates all of this too - this call is the real source of truth
    const supplier = await apiRequest('/suppliers', {
      method: 'POST',
      body: supplierData,
    });

    const opt = addSupplierOption(supplier);
    supplierSelect.value = opt.value;
    previousSupplierValue = opt.value;

    inlineSupplier.hidden = true;
    newSupplierName.value = '';
    newSupplierEmail.value = '';
    newSupplierPhone.value = '';
  } catch (err) {
    supplierError.textContent = err.message;
    supplierError.classList.add('show');
  } finally {
    saveSupplierBtn.disabled = false;
    saveSupplierBtn.textContent = 'Save supplier';
  }
});

// Main product form submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.classList.remove('show');

  const name = nameInput.value.trim();
  const price = priceInput.value;
  const quantity = quantityInput.value;
  const supplierId = supplierSelect.value;

  // CLIENT-SIDE VALIDATION - mirrors the server's rules so the user gets instant feedback,
  // but the server checks everything again since this can be bypassed
  let hasError = false;

  nameField.classList.toggle('has-error', !name);
  if (!name) hasError = true;

  const priceInvalid = price === '' || Number(price) < 0;
  priceField.classList.toggle('has-error', priceInvalid);
  if (priceInvalid) hasError = true;

  const quantityInvalid = quantity === '' || Number(quantity) < 0 || !Number.isInteger(Number(quantity));
  quantityField.classList.toggle('has-error', quantityInvalid);
  if (quantityInvalid) hasError = true;

  const supplierInvalid = !supplierId || supplierId === '__new__';
  supplierField.classList.toggle('has-error', supplierInvalid);
  if (supplierInvalid) hasError = true;

  if (hasError) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  // FormData (not plain JSON) because this request may include an image file
  const formData = new FormData();
  formData.append('name', name);
  formData.append('description', descriptionInput.value.trim());
  formData.append('price', price);
  formData.append('quantity', quantity);
  formData.append('supplierId', supplierId);
  if (imageInput.files[0]) {
    formData.append('image', imageInput.files[0]);
  }

  try {
    if (isEditMode) {
      await apiRequestForm(`/products/${productId}`, { method: 'PUT', formData });
    } else {
      await apiRequestForm('/products', { method: 'POST', formData });
    }
    window.location.href = 'products.html';
  } catch (err) {
    formError.textContent = err.message;
    formError.classList.add('show');
    submitBtn.disabled = false;
    submitBtn.textContent = isEditMode ? 'Save changes' : 'Save product';
  }
});

// Kick things off: load suppliers, then (if editing) load the product on top of that
async function init() {
  try {
    await loadSuppliers();
    if (isEditMode) {
      await loadExistingProduct();
      previousSupplierValue = supplierSelect.value;
    }
  } catch (err) {
    formError.textContent = `Could not load form data: ${err.message}`;
    formError.classList.add('show');
  }
}

init();
