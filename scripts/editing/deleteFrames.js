/*
 * This script deletes frames within a specified time range.
 * Frames with start times strictly between startTime and endTime are removed.
 */

const fs = require("fs");
const path = require("path");

// Configuration
const START_TIME = 426000;
const END_TIME = 433625;
const DELETE_CONTROL = true;
const DELETE_POSITION = false;

const deleteFramesInRange = (data, startTime, endTime, deleteControl = true, deletePosition = false) => {
    // Validate time range
    if (startTime >= endTime) {
        throw new Error(`Invalid time range: startTime (${startTime}) must be less than endTime (${endTime})`);
    }

    const updatedData = { ...data };
    let deletedControlCount = 0;
    let deletedPositionCount = 0;

    // Delete frames from control
    if (deleteControl && data.control) {
        const updatedControl = {};

        Object.entries(data.control).forEach(([frameKey, frame]) => {
            const frameStart = frame.start;

            // Delete if frame is strictly within range (exclusive)
            if (frameStart > startTime && frameStart < endTime) {
                deletedControlCount++;
            } else {
                updatedControl[frameKey] = frame;
            }
        });

        updatedData.control = updatedControl;
    }

    // Delete frames from position
    if (deletePosition && data.position) {
        const updatedPosition = {};

        Object.entries(data.position).forEach(([frameKey, frame]) => {
            const frameStart = frame.start;

            if (frameStart > startTime && frameStart < endTime) {
                deletedPositionCount++;
            } else {
                updatedPosition[frameKey] = frame;
            }
        });

        updatedData.position = updatedPosition;
    }

    return {
        data: updatedData,
        deletedControlCount,
        deletedPositionCount,
    };
};

// Main execution
if (require.main === module) {
    try {
        const inputPath = path.join(__dirname, "../../../LightTableBackup/2025.03.23.json");

        if (!fs.existsSync(inputPath)) {
            throw new Error(`Input file not found: ${inputPath}`);
        }

        const data = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

        const beforeControlCount = Object.keys(data.control || {}).length;
        const beforePositionCount = Object.keys(data.position || {}).length;

        console.log(`Before: ${beforeControlCount} control frames, ${beforePositionCount} position frames`);

        const result = deleteFramesInRange(
            data,
            START_TIME,
            END_TIME,
            DELETE_CONTROL,
            DELETE_POSITION
        );

        const afterControlCount = Object.keys(result.data.control || {}).length;
        const afterPositionCount = Object.keys(result.data.position || {}).length;

        console.log(`After: ${afterControlCount} control frames, ${afterPositionCount} position frames`);
        console.log(`Deleted: ${result.deletedControlCount} control frames, ${result.deletedPositionCount} position frames`);

        const outputPath = path.join(__dirname, "./deleted.json");
        fs.writeFileSync(outputPath, JSON.stringify(result.data, null, 2));
        console.log(`✓ Frames deleted and saved to ${outputPath}`);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

module.exports = { deleteFramesInRange };