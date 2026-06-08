const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function reset() {
  const hash = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.update({
    where: { email: 'adminmel@game.com' },
    data: { 
      password: hash,
      role: 'admin'
    },
  });
  
  console.log('✅ Password admin telah direset!');
  console.log('Email:', admin.email);
  console.log('Password: admin123');
  process.exit();
}

reset();