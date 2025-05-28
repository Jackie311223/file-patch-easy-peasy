/*
  Warnings:

  - The values [CARD,OTHER] on the enum `PaymentMethodV2` will be removed. If these variants are still used in the database, this will fail.
  - The values [UPC] on the enum `PaymentType` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `ownerId` on table `Property` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethodV2_new" AS ENUM ('CASH', 'BANK_TRANSFER', 'MOMO', 'NINEPAY', 'ONEPAY', 'OTA_TRANSFER', 'BANK_PERSONAL');
ALTER TABLE "Payment" ALTER COLUMN "method" TYPE "PaymentMethodV2_new" USING ("method"::text::"PaymentMethodV2_new");
ALTER TYPE "PaymentMethodV2" RENAME TO "PaymentMethodV2_old";
ALTER TYPE "PaymentMethodV2_new" RENAME TO "PaymentMethodV2";
DROP TYPE "PaymentMethodV2_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentType_new" AS ENUM ('HOTEL_COLLECT', 'OTA_COLLECT');
ALTER TABLE "Payment" ALTER COLUMN "paymentType" TYPE "PaymentType_new" USING ("paymentType"::text::"PaymentType_new");
ALTER TYPE "PaymentType" RENAME TO "PaymentType_old";
ALTER TYPE "PaymentType_new" RENAME TO "PaymentType";
DROP TYPE "PaymentType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_ownerId_fkey";

-- AlterTable
ALTER TABLE "Property" ALTER COLUMN "ownerId" SET NOT NULL;

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
