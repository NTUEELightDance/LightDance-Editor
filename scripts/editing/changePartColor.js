/*
 * This script updates part colors for specific dancers during time ranges.
 * It replaces old color names with new ones for selected parts.
 * 
 * The modified data is saved to 'props.json'.
 */

const fs = require("fs");
const path = require("path");

// Configuration
const COLOR_MAPPING = {
    "good_pink": "sky_blue",
    "peach_pink": "sky_blue",
    "good_Purple": "light_blue",
};

const updateFrameForDancer = (frame, dancerIndex, partIndex, colorMapping) => {
    // Create shallow copies instead of deep clones
    const status = frame.status.map((dancer, idx) =>
        idx === dancerIndex
            ? [
                ...dancer.slice(0, partIndex),
                updateColor(dancer[partIndex], colorMapping),
                ...dancer.slice(partIndex + 1),
            ]
            : dancer
    );

    const led_status = frame.led_status.map((dancer, idx) =>
        idx === dancerIndex ? [[], ...dancer.slice(1)] : dancer
    );

    return {
        ...frame,
        status,
        led_status,
    };
};

const updateColor = (colorData, colorMapping) => {
    const [currentColor, alpha] = colorData;
    const newColor = colorMapping[currentColor] || currentColor;
    return [newColor, alpha];
};

const changePartColor = (
    data,
    startTime,
    endTime,
    dancerName,
    partName,
    colorMapping
) => {
    // Validate dancer exists
    const dancer = data.dancer.find((d) => d.name === dancerName);
    if (!dancer) {
        throw new Error(`Dancer "${dancerName}" not found`);
    }

    // Validate part exists
    const part = dancer.parts.find((p) => p.name === partName);
    if (!part) {
        throw new Error(`Part "${partName}" not found for dancer "${dancerName}"`);
    }

    // Get indices
    const dancerIndex = data.dancer.findIndex((d) => d.name === dancerName);
    const partIndex = dancer.parts.findIndex((p) => p.name === partName);

    // Find and update frames in time range
    const updatedControl = {};
    Object.entries(data.control).forEach(([frameKey, controlFrame]) => {
        const frameStart = controlFrame.start || 0;

        // Check if frame is within time range
        if (frameStart >= startTime && frameStart <= endTime) {
            updatedControl[frameKey] = updateFrameForDancer(
                controlFrame,
                dancerIndex,
                partIndex,
                colorMapping
            );
        } else {
            updatedControl[frameKey] = controlFrame;
        }
    });

    return {
        ...data,
        control: updatedControl,
    };
};

// Main execution
if (require.main === module) {
    try {
        const inputPath = path.join(__dirname, "../../utils/jsons/exportDataEmpty.json");

        if (!fs.existsSync(inputPath)) {
            throw new Error(`Input file not found: ${inputPath}`);
        }

        const data = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

        // Configuration
        const startTime = 0;
        const endTime = 5000000;
        const dancerName = "0";
        const partName = "mask_LED";

        const modifiedData = changePartColor(
            data,
            startTime,
            endTime,
            dancerName,
            partName,
            COLOR_MAPPING
        );

        const outputPath = path.join(__dirname, "./props.json");
        fs.writeFileSync(outputPath, JSON.stringify(modifiedData, null, 2));
        console.log(`✓ Part colors updated and saved to ${outputPath}`);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

module.exports = { changePartColor, updateColor, updateFrameForDancer };