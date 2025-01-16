/*
  Warnings:

  - Added the required column `informations` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `game` ADD COLUMN `informations` VARCHAR(191) NOT NULL;
