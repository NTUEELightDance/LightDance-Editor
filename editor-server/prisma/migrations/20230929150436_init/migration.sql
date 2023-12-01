-- CreateTable
CREATE TABLE `Color` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `r` INTEGER NOT NULL,
    `g` INTEGER NOT NULL,
    `b` INTEGER NOT NULL,

    UNIQUE INDEX `Color_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LEDState` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `effect_id` INTEGER NOT NULL,
    `position` INTEGER NOT NULL,
    `color_id` INTEGER NOT NULL,
    `alpha` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LEDEffect` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `part_name` VARCHAR(191) NOT NULL,
    `repeat` INTEGER NOT NULL,

    UNIQUE INDEX `LEDEffect_name_part_name_key`(`name`, `part_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EditingPositionFrame` (
    `user_id` INTEGER NOT NULL,
    `frame_id` INTEGER NULL,

    UNIQUE INDEX `EditingPositionFrame_frame_id_key`(`frame_id`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EditingControlFrame` (
    `user_id` INTEGER NOT NULL,
    `frame_id` INTEGER NULL,

    UNIQUE INDEX `EditingControlFrame_user_id_key`(`user_id`),
    UNIQUE INDEX `EditingControlFrame_frame_id_key`(`frame_id`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EditingLEDEffect` (
    `user_id` INTEGER NOT NULL,
    `led_effect_id` INTEGER NULL,

    UNIQUE INDEX `EditingLEDEffect_led_effect_id_key`(`led_effect_id`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dancer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Dancer_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Part` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dancer_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('LED', 'FIBER') NOT NULL,
    `length` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PositionData` (
    `dancer_id` INTEGER NOT NULL,
    `frame_id` INTEGER NOT NULL,
    `x` DOUBLE NOT NULL,
    `y` DOUBLE NOT NULL,
    `z` DOUBLE NOT NULL,

    PRIMARY KEY (`dancer_id`, `frame_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PositionFrame` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start` INTEGER NOT NULL,

    UNIQUE INDEX `PositionFrame_start_key`(`start`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ControlData` (
    `part_id` INTEGER NOT NULL,
    `frame_id` INTEGER NOT NULL,
    `type` ENUM('COLOR', 'EFFECT') NOT NULL,
    `color_id` INTEGER NULL,
    `effect_id` INTEGER NULL,
    `alpha` INTEGER NOT NULL,

    PRIMARY KEY (`part_id`, `frame_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ControlFrame` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start` INTEGER NOT NULL,
    `fade` BOOLEAN NOT NULL,

    UNIQUE INDEX `ControlFrame_start_key`(`start`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EffectListData` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start` INTEGER NOT NULL,
    `end` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Logger` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user` INTEGER NOT NULL,
    `variable_value` JSON NULL,
    `field_name` VARCHAR(191) NOT NULL,
    `time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL,
    `error_message` JSON NULL,
    `result` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LEDState` ADD CONSTRAINT `LEDState_effect_id_fkey` FOREIGN KEY (`effect_id`) REFERENCES `LEDEffect`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EditingPositionFrame` ADD CONSTRAINT `EditingPositionFrame_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EditingPositionFrame` ADD CONSTRAINT `EditingPositionFrame_frame_id_fkey` FOREIGN KEY (`frame_id`) REFERENCES `PositionFrame`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EditingControlFrame` ADD CONSTRAINT `EditingControlFrame_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EditingControlFrame` ADD CONSTRAINT `EditingControlFrame_frame_id_fkey` FOREIGN KEY (`frame_id`) REFERENCES `ControlFrame`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EditingLEDEffect` ADD CONSTRAINT `EditingLEDEffect_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EditingLEDEffect` ADD CONSTRAINT `EditingLEDEffect_led_effect_id_fkey` FOREIGN KEY (`led_effect_id`) REFERENCES `LEDEffect`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Part` ADD CONSTRAINT `Part_dancer_id_fkey` FOREIGN KEY (`dancer_id`) REFERENCES `Dancer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PositionData` ADD CONSTRAINT `PositionData_dancer_id_fkey` FOREIGN KEY (`dancer_id`) REFERENCES `Dancer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PositionData` ADD CONSTRAINT `PositionData_frame_id_fkey` FOREIGN KEY (`frame_id`) REFERENCES `PositionFrame`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControlData` ADD CONSTRAINT `ControlData_part_id_fkey` FOREIGN KEY (`part_id`) REFERENCES `Part`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControlData` ADD CONSTRAINT `ControlData_frame_id_fkey` FOREIGN KEY (`frame_id`) REFERENCES `ControlFrame`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControlData` ADD CONSTRAINT `ControlData_color_id_fkey` FOREIGN KEY (`color_id`) REFERENCES `Color`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControlData` ADD CONSTRAINT `ControlData_effect_id_fkey` FOREIGN KEY (`effect_id`) REFERENCES `LEDEffect`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
