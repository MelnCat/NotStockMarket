/*
  Warnings:

  - Added the required column `bio` to the `Cat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cat" ADD COLUMN     "bio" TEXT NOT NULL;
