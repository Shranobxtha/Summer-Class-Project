const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { User, Supplier, Product } = require('./models');

// Runs automatically every time the server starts (see server.js).
// Render's free tier wipes both the SQLite file AND the uploads/ folder on every
// spin-down/restart, so without this the site would come back up completely empty
// (and any product images would be broken links) every time it wakes from being idle.
//
// The trick: server/seed-assets/ is a normal folder committed to git (NOT gitignored,
// unlike uploads/), so its image files are always there fresh on every deploy. This
// function copies them into uploads/ and links them to their product - every restart.
//
// This is safe to run repeatedly: it checks what already exists before creating anything,
// so it won't create duplicates if the data happens to still be there.

const SEED_ASSETS_DIR = path.join(__dirname, 'seed-assets');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Copies a seed image into uploads/ (giving it a unique name like multer would)
// and returns the imageUrl to store on the product. Returns null if the source
// image file isn't there for some reason, so seeding can still continue without it.
function copySeedImage(filename) {
  const source = path.join(SEED_ASSETS_DIR, filename);
  if (!fs.existsSync(source)) {
    console.warn(`Seed image not found: ${filename} - skipping image for this product`);
    return null;
  }
  const uniqueName = `product-${Date.now()}-${filename}`;
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  fs.copyFileSync(source, path.join(UPLOADS_DIR, uniqueName));
  return `/uploads/${uniqueName}`;
}

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

  const cgFoods = await Supplier.create({
    name: 'CG Foods Pvt. Ltd.',
    contactEmail: 'sales@cgfoods.com',
    phone: '+9779860016798',
  });
  const yasodhaFoods = await Supplier.create({
    name: 'Yasodha Foods',
    contactEmail: 'contact@yashodafoods.com',
    phone: '+9779861236548',
  });

  await Product.bulkCreate([
    {
      name: 'Wai Wai',
      description: 'Wai Wai instant noodles. Eat it boiled, fried or directly from the packet after adding seasonings.',
      price: 0.2,
      quantity: 50,
      supplierId: cgFoods.id,
      imageUrl: copySeedImage('wai-wai.png'),
    },
    {
      name: 'Current Spicey Noodles',
      description: 'Current Spicy noodles is so spicy your stomach might hurt badly. Eat at your own risk.',
      price: 0.5,
      quantity: 4,
      supplierId: yasodhaFoods.id,
      imageUrl: copySeedImage('current-spicy-noodles.png'),
    },
  ]);

  console.log('Seeded starter suppliers and products');
}

module.exports = seedData;
