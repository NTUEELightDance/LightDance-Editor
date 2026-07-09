/*
 * This script copies part status and LED status from one frame to all frames within a time range.
 * Useful for applying the same part configuration across multiple frames.
 * 
 * The modified data is saved to 'props.json'.
 */

const fs = require("fs");
const path = require("path");

// Configuration
const SOURCE_FRAME_START_TIME = 463344;
const TARGET_START_TIME = 463812;
const TARGET_END_TIME = 100000000;
const DANCER_INDEX = 0;

const findFrameByStartTime = (control, startTime) => {
    const entry = Object.entries(control).find(
        ([_, frame]) => frame.start === startTime
    );
    return entry ? entry[1] : null;
};

const getFramesInTimeRange = (control, startTime, endTime) => {
    return Object.entries(control).filter(
        ([_, frame]) => frame.start >= startTime && frame.start <= endTime
    );
};

const copyPart = (data, sourceStartTime, targetStartTime, targetEndTime, dancerIndex) => {
    // Validate source frame exists
    const sourceFrame = findFrameByStartTime(data.control, sourceStartTime);
    if (!sourceFrame) {
        throw new Error(`Source frame with start time ${sourceStartTime} not found`);
    }

    // Validate dancer index
    if (dancerIndex >= data.dancer.length) {
        throw new Error(`Dancer index ${dancerIndex} out of range (max: ${data.dancer.length - 1})`);
    }

    // Validate parts exist
    if (!sourceFrame.status[dancerIndex]) {
        throw new Error(`Status for dancer ${dancerIndex} not found in source frame`);
    }
    if (!sourceFrame.led_status[dancerIndex]) {
        throw new Error(`LED status for dancer ${dancerIndex} not found in source frame`);
    }

    // Extract source data
    const sourceStatus = sourceFrame.status[dancerIndex];
    const sourceLEDStatus = sourceFrame.led_status[dancerIndex];

    // Get frames in target time range
    const targetFrames = getFramesInTimeRange(data.control, targetStartTime, targetEndTime);

    if (targetFrames.length === 0) {
        console.warn(`⚠ No frames found in time range [${targetStartTime}, ${targetEndTime}]`);
    }

    // Apply source data to all target frames
    const updatedControl = { ...data.control };

    targetFrames.forEach(([frameKey, targetFrame]) => {
        updatedControl[frameKey] = {
            ...targetFrame,
            status: [
                ...targetFrame.status.slice(0, dancerIndex),
                sourceStatus,
                ...targetFrame.status.slice(dancerIndex + 1),
            ],
            led_status: [
                ...targetFrame.led_status.slice(0, dancerIndex),
                sourceLEDStatus,
                ...targetFrame.led_status.slice(dancerIndex + 1),
            ],
        };
    });

    return {
        ...data,
        control: updatedControl,
    };
};

// Main execution
if (require.main === module) {
    try {
        const inputPath = path.join(__dirname, "./props.json");

        if (!fs.existsSync(inputPath)) {
            throw new Error(`Input file not found: ${inputPath}`);
        }

        const data = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

        const modifiedData = copyPart(
            data,
            SOURCE_FRAME_START_TIME,
            TARGET_START_TIME,
            TARGET_END_TIME,
            DANCER_INDEX
        );

        const outputPath = path.join(__dirname, "./props.json");
        fs.writeFileSync(outputPath, JSON.stringify(modifiedData, null, 2));
        console.log(`✓ Part copied from frame ${SOURCE_FRAME_START_TIME} to frames [${TARGET_START_TIME}, ${TARGET_END_TIME}]`);
        console.log(`✓ Total frames processed: ${Object.keys(data.control).length}`);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

module.exports = { copyPart, findFrameByStartTime, getFramesInTimeRange };