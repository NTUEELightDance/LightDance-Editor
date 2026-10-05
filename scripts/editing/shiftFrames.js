/*
 * This script shifts frame start times within specified time ranges.
 * Multiple shift operations can be applied sequentially.
 * Useful for adjusting timing across different sections of a performance.
 * 
 * The modified data is saved to 'shifted.json'.
 */

const fs = require("fs");
const path = require("path");

// Configuration - array of shifts to apply in order
const FRAME_SHIFTS = [
    { startTime: 336007, endTime: 6000000, shift: 12857 },
    { startTime: 215928, endTime: 336007, shift: 10050 },
    { startTime: 157289, endTime: 215928, shift: 7294 },
    { startTime: 98125, endTime: 157289, shift: 3750 },
];

const shiftFramesInRange = (frames, startTime, endTime, shiftAmount) => {
    if (!frames) return frames;

    // Validate inputs
    if (startTime >= endTime) {
        throw new Error(`Invalid time range: startTime (${startTime}) must be less than endTime (${endTime})`);
    }

    if (shiftAmount === 0) {
        console.warn("⚠ Shift amount is 0, no changes will be made");
    }

    let shiftedCount = 0;

    const updatedFrames = {};

    Object.entries(frames).forEach(([frameKey, frame]) => {
        const frameStart = frame.start;

        // Shift if frame is strictly within range (exclusive)
        if (frameStart > startTime && frameStart < endTime) {
            updatedFrames[frameKey] = {
                ...frame,
                start: frameStart + shiftAmount,
            };
            shiftedCount++;
        } else {
            updatedFrames[frameKey] = frame;
        }
    });

    return { frames: updatedFrames, shiftedCount };
};

const applyMultipleShifts = (data, shifts) => {
    let updatedData = { ...data };
    const results = [];

    shifts.forEach((shiftConfig, index) => {
        const { startTime, endTime, shift } = shiftConfig;

        console.log(`\nApplying shift ${index + 1}/${shifts.length}...`);
        console.log(`  Range: [${startTime}, ${endTime}], Shift: ${shift}`);

        // Shift control frames
        const controlResult = shiftFramesInRange(
            updatedData.control,
            startTime,
            endTime,
            shift
        );
        updatedData.control = controlResult.frames;

        // Shift position frames
        const positionResult = shiftFramesInRange(
            updatedData.position,
            startTime,
            endTime,
            shift
        );
        updatedData.position = positionResult.frames;

        results.push({
            shiftConfig,
            controlShifted: controlResult.shiftedCount,
            positionShifted: positionResult.shiftedCount,
        });

        console.log(`  Shifted: ${controlResult.shiftedCount} control, ${positionResult.shiftedCount} position frames`);
    });

    return { data: updatedData, results };
};

// Main execution
if (require.main === module) {
    try {
        const inputPath = path.join(__dirname, "./saber.json");

        if (!fs.existsSync(inputPath)) {
            throw new Error(`Input file not found: ${inputPath}`);
        }

        const data = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

        console.log(`Starting with ${Object.keys(data.control || {}).length} control frames and ${Object.keys(data.position || {}).length} position frames`);

        const { data: modifiedData, results } = applyMultipleShifts(data, FRAME_SHIFTS);

        let totalControlShifted = 0;
        let totalPositionShifted = 0;

        results.forEach((result) => {
            totalControlShifted += result.controlShifted;
            totalPositionShifted += result.positionShifted;
        });

        console.log(`\n✓ Total shifted: ${totalControlShifted} control frames, ${totalPositionShifted} position frames`);
        console.log(`Final: ${Object.keys(modifiedData.control || {}).length} control frames and ${Object.keys(modifiedData.position || {}).length} position frames`);

        const outputPath = path.join(__dirname, "./shifted.json");
        fs.writeFileSync(outputPath, JSON.stringify(modifiedData, null, 2));
        console.log(`✓ Shifted frames saved to ${outputPath}`);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

module.exports = { shiftFramesInRange, applyMultipleShifts };