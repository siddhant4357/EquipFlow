require('dotenv').config();
const connectDB = require('./src/config/db');
const User = require('./src/models/user.model');
const Asset = require('./src/models/asset.model');
const { generateQRCode } = require('./src/utils/qrcode.util');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...\n');

  // Clear existing
  await User.deleteMany({});
  await Asset.deleteMany({});

  // Create users
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@equipflow.com',
    password: 'admin123',
    role: 'admin',
  });
  const manager = await User.create({
    name: 'Site Manager',
    email: 'manager@equipflow.com',
    password: 'manager123',
    role: 'manager',
  });
  const operator = await User.create({
    name: 'Field Operator',
    email: 'operator@equipflow.com',
    password: 'operator123',
    role: 'operator',
  });

  console.log('✅ Users created:');
  console.log(`   Admin    → admin@equipflow.com / admin123`);
  console.log(`   Manager  → manager@equipflow.com / manager123`);
  console.log(`   Operator → operator@equipflow.com / operator123\n`);

  // Create sample assets
  const assetDefs = [
    { name: 'Forklift #1', category: 'vehicle', description: 'Main warehouse forklift', status: 'active' },
    { name: 'Laptop Dell XPS', category: 'it-equipment', description: 'Engineering laptop', status: 'active' },
    { name: 'Hydraulic Drill', category: 'tool', description: 'Heavy-duty drilling tool', status: 'maintenance' },
    { name: 'Generator Unit A', category: 'machinery', description: 'Backup power generator', status: 'active' },
    { name: 'Safety Helmet Set', category: 'other', description: 'PPE gear - 10 units', status: 'in-transit' },
  ];

  for (const def of assetDefs) {
    const asset = await Asset.create({ ...def, createdBy: admin._id });
    asset.qrCode = await generateQRCode(asset.assetId);
    await asset.save();
    console.log(`✅ Asset: ${asset.name} → ${asset.assetId}`);
  }

  console.log('\n🎉 Seeding complete! Run `npm run dev` to start the server.\n');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
