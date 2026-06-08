const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // Hapus admin lama jika ada
  await prisma.user.deleteMany({
    where: { email: 'admin@game.com' }
  });
  
  // Buat admin baru
  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@game.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Admin berhasil dibuat!');
  console.log('📧 Email: admin@game.com');
  console.log('🔑 Password: admin123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });