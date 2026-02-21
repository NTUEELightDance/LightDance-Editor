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
CREATE TABLE `LEDEffectState` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `effect_id` INTEGER NOT NULL,
    `position` INTEGER NOT NULL,
    `color_id` INTEGER NOT NULL,
    `alpha` INTEGER NOT NULL,

    UNIQUE INDEX `LEDEffectState_effect_id_position_key`(`effect_id`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LEDEffect` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `model_id` INTEGER NOT NULL,
    `part_id` INTEGER NOT NULL,

    UNIQUE INDEX `LEDEffect_name_model_id_part_id_key`(`name`, `model_id`, `part_id`),
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
CREATE TABLE `Model` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Model_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dancer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `model_id` INTEGER NOT NULL,

    UNIQUE INDEX `Dancer_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Part` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `model_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('LED', 'FIBER') NOT NULL,
    `length` INTEGER NULL,

    UNIQUE INDEX `Part_name_model_id_key`(`name`, `model_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PositionData` (
    `dancer_id` INTEGER NOT NULL,
    `frame_id` INTEGER NOT NULL,
    `x` DOUBLE NOT NULL,
    `y` DOUBLE NOT NULL,
    `z` DOUBLE NOT NULL,
    `rx` DOUBLE NOT NULL DEFAULT 0,
    `ry` DOUBLE NOT NULL DEFAULT 0,
    `rz` DOUBLE NOT NULL DEFAULT 0,

    PRIMARY KEY (`dancer_id`, `frame_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PositionFrame` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start` INTEGER NOT NULL,
    `meta_rev` INTEGER NOT NULL DEFAULT 0,
    `data_rev` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `PositionFrame_start_key`(`start`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LEDBulb` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `control_id` INTEGER NOT NULL,
    `position` INTEGER NOT NULL,
    `color_id` INTEGER NOT NULL,
    `alpha` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ControlData` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dancer_id` INTEGER NOT NULL,
    `part_id` INTEGER NOT NULL,
    `frame_id` INTEGER NOT NULL,
    `type` ENUM('COLOR', 'EFFECT', 'LED_BULBS') NOT NULL,
    `color_id` INTEGER NULL,
    `effect_id` INTEGER NULL,
    `alpha` INTEGER NOT NULL,

    UNIQUE INDEX `ControlData_dancer_id_part_id_frame_id_key`(`dancer_id`, `part_id`, `frame_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ControlFrame` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start` INTEGER NOT NULL,
    `fade` BOOLEAN NOT NULL,
    `meta_rev` INTEGER NOT NULL DEFAULT 0,
    `data_rev` INTEGER NOT NULL DEFAULT 0,

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

-- CreateTable
CREATE TABLE `Revision` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Revision_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LEDEffectState` ADD CONSTRAINT `LEDEffectState_effect_id_fkey` FOREIGN KEY (`effect_id`) REFERENCES `LEDEffect`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LEDEffect` ADD CONSTRAINT `LEDEffect_model_id_fkey` FOREIGN KEY (`model_id`) REFERENCES `Model`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LEDEffect` ADD CONSTRAINT `LEDEffect_part_id_fkey` FOREIGN KEY (`part_id`) REFERENCES `Part`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EditingPositionFrame` ADD CONSTRAINT `EditingPositionFrame_frame_id_fkey` FOREIGN KEY (`frame_id`) REFERENCES `PositionFrame`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EditingControlFrame` ADD CONSTRAINT `EditingControlFrame_frame_id_fkey` FOREIGN KEY (`frame_id`) REFERENCES `ControlFrame`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EditingLEDEffect` ADD CONSTRAINT `EditingLEDEffect_led_effect_id_fkey` FOREIGN KEY (`led_effect_id`) REFERENCES `LEDEffect`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dancer` ADD CONSTRAINT `Dancer_model_id_fkey` FOREIGN KEY (`model_id`) REFERENCES `Model`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Part` ADD CONSTRAINT `Part_model_id_fkey` FOREIGN KEY (`model_id`) REFERENCES `Model`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PositionData` ADD CONSTRAINT `PositionData_dancer_id_fkey` FOREIGN KEY (`dancer_id`) REFERENCES `Dancer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PositionData` ADD CONSTRAINT `PositionData_frame_id_fkey` FOREIGN KEY (`frame_id`) REFERENCES `PositionFrame`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LEDBulb` ADD CONSTRAINT `LEDBulb_control_id_fkey` FOREIGN KEY (`control_id`) REFERENCES `ControlData`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControlData` ADD CONSTRAINT `ControlData_part_id_fkey` FOREIGN KEY (`part_id`) REFERENCES `Part`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControlData` ADD CONSTRAINT `ControlData_frame_id_fkey` FOREIGN KEY (`frame_id`) REFERENCES `ControlFrame`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControlData` ADD CONSTRAINT `ControlData_dancer_id_fkey` FOREIGN KEY (`dancer_id`) REFERENCES `Dancer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControlData` ADD CONSTRAINT `ControlData_color_id_fkey` FOREIGN KEY (`color_id`) REFERENCES `Color`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControlData` ADD CONSTRAINT `ControlData_effect_id_fkey` FOREIGN KEY (`effect_id`) REFERENCES `LEDEffect`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
