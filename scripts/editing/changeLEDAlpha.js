/*
 * This script updates FIBER alpha (opacity) values across all frames.
 * It changes FIBER parts with alpha value 200 to 227.
 * 
 * The updated data is saved to `scripts/editing/fiber.json`.
 */

const fs = require("fs");
const path = require("path");

// Configuration
const DANCER_COUNT = 5;
const TARGET_PART_TYPE = "FIBER";
const OLD_ALPHA = 200;
const NEW_ALPHA = 227;

const updateFiberAlpha = (data) => {
    for (const [frameKey, controlData] of Object.entries(data.control)) {
        for (let dancer_id = 0; dancer_id < DANCER_COUNT; dancer_id++) {
            if (!data.dancer[dancer_id]) continue;

            const parts = data.dancer[dancer_id].parts;

            for (let part_id = 0; part_id < parts.length; part_id++) {
                const part = parts[part_id];

                // Only process FIBER parts with target alpha value
                if (
                    part.type === TARGET_PART_TYPE &&
                    controlData.status[dancer_id]?.[part_id]?.[1] === OLD_ALPHA
                ) {
                    controlData.status[dancer_id][part_id][1] = NEW_ALPHA;
                }
            }
        }
    }
};

// Main execution
if (require.main === module) {
    try {
        const inputPath = path.join(__dirname, "../../../LightTableBackup/2025.03.24.json");

        if (!fs.existsSync(inputPath)) {
            throw new Error(`Input file not found: ${inputPath}`);
        }

        const data = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

        updateFiberAlpha(data);

        const outputPath = path.join(__dirname, "./fiber.json");
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log(`✓ Updated fiber alpha values saved to ${outputPath}`);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

module.exports = { updateFiberAlpha };