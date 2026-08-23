/*
  Warnings:

  - Added the required column `expires` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "expires" TIMESTAMP(3) NOT NULL;
