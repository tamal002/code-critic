/*
  Warnings:

  - You are about to drop the column `sibscriptionStatus` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "sibscriptionStatus",
ADD COLUMN     "subscriptionStatus" TEXT;
