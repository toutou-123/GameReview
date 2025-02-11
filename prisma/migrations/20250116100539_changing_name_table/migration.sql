/*
  Warnings:

  - You are about to drop the `_gametocategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_gametocategory` DROP FOREIGN KEY `_GameToCategory_A_fkey`;

-- DropForeignKey
ALTER TABLE `_gametocategory` DROP FOREIGN KEY `_GameToCategory_B_fkey`;

-- DropTable
DROP TABLE `_gametocategory`;

-- CreateTable
CREATE TABLE `_GameByCategory` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_GameByCategory_AB_unique`(`A`, `B`),
    INDEX `_GameByCategory_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_GameByCategory` ADD CONSTRAINT `_GameByCategory_A_fkey` FOREIGN KEY (`A`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GameByCategory` ADD CONSTRAINT `_GameByCategory_B_fkey` FOREIGN KEY (`B`) REFERENCES `Game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
