/*
  Warnings:

  - Added the required column `title` to the `Banner` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `Banner` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `Shop` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shop` on table `Shop` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Banner` ADD COLUMN `title` VARCHAR(191) NOT NULL,
    MODIFY `name` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Shop` MODIFY `name` VARCHAR(191) NOT NULL,
    MODIFY `shop` VARCHAR(191) NOT NULL;
