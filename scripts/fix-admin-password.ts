import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  const admin = await prisma.user.update({
    where: { email: "admin@game.com" },
    data: { password: hashedPassword },
  });
  
  console.log("✅ Password admin updated!");
  console.log("Email:", admin.email);
  console.log("Role:", admin.role);
  console.log("Password hash baru:", admin.password);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());