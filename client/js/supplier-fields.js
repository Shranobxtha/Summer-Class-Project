// Shared validation rules for the 3 supplier fields (name, email, phone).
// This lives in one place so the inline "+ Add new supplier" box on product-form.html
// and the full supplier-form.html page both follow the exact same rules - no copy-pasting
// the same checks into two files that could quietly drift apart.
//
// Takes the actual DOM elements, toggles the has-error styling on them itself,
// and returns the clean data ready to send to the server - or null if something's invalid.
function validateSupplierFields({ nameInput, emailInput, phoneInput, nameField, emailField, phoneField }) {
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  nameField.classList.toggle('has-error', !name);
  emailField.classList.toggle('has-error', !emailLooksValid);
  phoneField.classList.toggle('has-error', !phone);

  if (!name || !emailLooksValid || !phone) return null;

  return { name, contactEmail: email, phone };
}
