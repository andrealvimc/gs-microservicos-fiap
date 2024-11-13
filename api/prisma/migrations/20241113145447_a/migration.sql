/*
  Warnings:

  - Added the required column `status` to the `Certificate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "status" TEXT NOT NULL,
ALTER COLUMN "pdfPath" DROP NOT NULL;
