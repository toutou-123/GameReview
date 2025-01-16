/*
  Warnings:

  - Added the required column `developer` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `game` ADD COLUMN `developer` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `isBanned` BOOLEAN NOT NULL DEFAULT false;
