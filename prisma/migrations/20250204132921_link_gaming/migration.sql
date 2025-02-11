/*
  Warnings:

  - You are about to drop the column `link` on the `game` table. All the data in the column will be lost.
  - Added the required column `linkFandom` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `linkSteam` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `game` DROP COLUMN `link`,
    ADD COLUMN `linkFandom` VARCHAR(191) NOT NULL,
    ADD COLUMN `linkSteam` VARCHAR(191) NOT NULL;
