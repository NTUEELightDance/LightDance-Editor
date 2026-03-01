/* 
 * This script merges old dancer data with new dancer data, ensuring that new dancers
 * are properly initialized with default positions, rotations, and effects.
 * 
 * To test out this script, simply run 
 * `node scripts/editing/addNewDancers.test.js` 
 * 
 * The merged data will be saved to `out/exportData_merged.json`.
 */

const fs = require("fs");
const path = require("path");

const DEFAULT_POSITION_X = -5;
const DEFAULT_SPACING = 1;
const DEFAULT_ROTATION = [0, 0, 0];
const DEFAULT_COLOR = ["black", 0];

const generateDefaultLocation = (dancers) => {
    const length = dancers.length;
    return dancers.map((_, index) => [
        DEFAULT_POSITION_X,
        (index - (length - 1) / 2) * DEFAULT_SPACING,
        0,
    ]);
};

const extendArray = (arr, targetLength, fillFn) => {
    for (let i = arr.length; i < targetLength; i++) {
        arr.push(fillFn(i));
    }
};

const merge = (oldData, newData, defaultLocation) => {
    const mergedDancer = newData.dancer;
    const mergedPosition = oldData.position;
    const mergedControl = oldData.control;
    const mergedColor = oldData.color;
    const mergedLEDEffects = oldData.LEDEffects;

    // Extend positions for new dancers
    Object.values(mergedPosition).forEach((frame) => {
        extendArray(frame.location, mergedDancer.length, (i) => defaultLocation[i]);
        extendArray(frame.rotation, mergedDancer.length, () => DEFAULT_ROTATION);
    });

    // Extend control status for new dancers
    Object.values(mergedControl).forEach((frame) => {
        extendArray(frame.status, mergedDancer.length, (i) => {
            return mergedDancer[i].parts.map(() => DEFAULT_COLOR);
        });

        extendArray(frame.led_status, mergedDancer.length, (i) => {
            return mergedDancer[i].parts.map(() => []);
        });
    });

    // Initialize LED effects for new dancers
    mergedDancer.forEach((dancer) => {
        if (dancer.model in mergedLEDEffects) return;

        const dancerEffects = {};

        dancer.parts.forEach((part) => {
            if (part.type !== "LED") return;

            const partEffects = {};

            Object.keys(mergedColor).forEach((colorName) => {
                partEffects[colorName] = {
                    repeat: 0,
                    frames: [
                        {
                            LEDs: Array(part.length).fill([colorName, 255]),
                            start: 0,
                            fade: false,
                        },
                    ],
                };
            });

            dancerEffects[part.name] = partEffects;
        });

        mergedLEDEffects[dancer.model] = dancerEffects;
    });

    return {
        dancer: mergedDancer,
        position: mergedPosition,
        control: mergedControl,
        color: mergedColor,
        LEDEffects: mergedLEDEffects,
    };
};

// Main execution
if (require.main === module) {
    try {
        const oldData = JSON.parse(fs.readFileSync("./out/exportData.json", "utf-8"));
        const newData = JSON.parse(fs.readFileSync("../../utils/jsons/exportDataEmpty.json", "utf-8"));

        const defaultLocation = generateDefaultLocation(newData.dancer);
        const mergedData = merge(oldData, newData, defaultLocation);

        const outputPath = path.join("./out", "exportData_merged.json");
        fs.writeFileSync(outputPath, JSON.stringify(mergedData, null, 2));
        console.log(JSON.stringify(mergedData, null, 2));
        console.log(`✓ Merged data written to ${outputPath}`);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

module.exports = { merge, generateDefaultLocation, extendArray };