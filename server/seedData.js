const bcrypt = require('bcryptjs');
const { User, Supplier, Product } = require('./models');

// Runs automatically every time the server starts (see server.js).
// Render's free tier wipes the SQLite file on every spin-down/restart, so without this
// the site would come back up completely empty each time it wakes from being idle.
//
// This is safe to run repeatedly: it checks what already exists before creating anything,
// so it won't create duplicates if the data happens to still be there.
async function seedData() {
  // 1. Make sure the admin login always exists
  const existingAdmin = await User.findOne({ where: { username: 'admin' } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({ username: 'admin', password: hashedPassword });
    console.log('Seeded admin user (admin / admin123)');
  }

  // 2. Only seed suppliers/products if the database is completely empty -
  // this way anything added while the app is running isn't touched or duplicated
  const productCount = await Product.count();
  if (productCount > 0) {
    console.log('Data already present, skipping seed.');
    return;
  }

  const everest = await Supplier.create({
    name: 'Everest Distributors',
    contactEmail: 'sales@everestdist.com',
    phone: '9801112223',
  });
  const himal = await Supplier.create({
    name: 'Himal Foods Pvt Ltd',
    contactEmail: 'info@himalfoods.com',
    phone: '9802223334',
  });

  await Product.bulkCreate([
    { name: 'Basmati Rice 5kg', description: 'Premium long-grain rice', price: 12.5, quantity: 40, supplierId: everest.id },
    { name: 'Mustard Oil 1L', description: 'Cold-pressed cooking oil', price: 3.2, quantity: 3, supplierId: everest.id },
    { name: 'Turmeric Powder 200g', description: 'Pure ground turmeric', price: 1.8, quantity: 60, supplierId: himal.id },
    { name: 'Green Lentils 1kg', description: 'Dried moong lentils', price: 2.1, quantity: 2, supplierId: himal.id },
  ]);

  console.log('Seeded starter suppliers and products');
}

module.exports = seedData;
