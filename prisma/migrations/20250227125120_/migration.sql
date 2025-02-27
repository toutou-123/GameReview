-- AlterTable
ALTER TABLE `comment` MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `game` MODIFY `updatedAt` DATETIME(3) NULL,
    MODIFY `linkFandom` VARCHAR(191) NULL,
    MODIFY `linkSteam` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `updatedAt` DATETIME(3) NULL;
