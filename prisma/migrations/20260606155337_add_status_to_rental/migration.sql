-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "platform" SET DEFAULT 'Android';

-- AlterTable
ALTER TABLE "Rental" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ALTER COLUMN "is_active" SET DEFAULT false;
