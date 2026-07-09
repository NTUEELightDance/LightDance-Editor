/*
 * This script updates dancer colors across all frames by replacing old color names
 * with new ones based on dancer groups and part indices.
 * 
 * To run this script, use the command:
 * `node scripts/editing/changeDancerColor.test.js`
 * 
 * The updated data will be saved to `scripts/editing/updatedColor.json`.
 */

const fs = require('fs');
const path = require('path');

const COLOR_MAPPINGS = [
    {
        name: "Dancer 0 color fix",
        dancerRange: [0, 1],
        partRange: [0, 31],
        colorMap: {
            "bad_blue": "bad_orange_crayola",
            "bad_green": "bad_orange_crayola",
            "bad_orange_light_p": "bad_orange_crayola",
            "orange_dark_p": "bad_orange_crayola",
        },
    },
    {
        name: "Dancer 1-4 color fix",
        dancerRange: [1, 5],
        partRange: [0, 39],
        colorMap: {
            "bad_blue": "bad_orange_crayola",
            "bad_green": "bad_orange_crayola",
            "bad_orange_light_p": "bad_orange_crayola",
            "orange_dark_p": "bad_orange_crayola",
            "bad_blur_blue": "bad_red",
        },
        specialRules: [
            {
                condition: (dancer_id, part_id) => part_id === 35,
                originalColor: "bad_orange_crayola",
                newColor: "bad_red",
            },
        ],
    },
    {
        name: "Dancer 5-7 color fix",
        dancerRange: [5, 8],
        partRange: [0, 36],
        colorMap: {
            "pink": "good_Purple",
        },
    },
];

const applyColorMappings = (data) => {
    for (const [frameKey, controlData] of Object.entries(data.control)) {
        // console.log(`Processing frame key ${frameKey}...`);
        for (const mapping of COLOR_MAPPINGS) {
            const [dancerStart, dancerEnd] = mapping.dancerRange;
            const [partStart, partEnd] = mapping.partRange;

            for (let dancer_id = dancerStart; dancer_id < dancerEnd; dancer_id++) {
                if (!controlData.status[dancer_id]) continue;

                for (let part_id = partStart; part_id < partEnd; part_id++) {
                    if (!controlData.status[dancer_id][part_id]) continue;

                    const currentColor = controlData.status[dancer_id][part_id][0];

                    // Check special rules FIRST (before regular mappings)
                    let colorChanged = false;
                    if (mapping.specialRules) {
                        for (const rule of mapping.specialRules) {
                            if (
                                rule.condition(dancer_id, part_id) &&
                                currentColor === rule.originalColor
                            ) {
                                controlData.status[dancer_id][part_id][0] = rule.newColor;
                                colorChanged = true;
                                break;
                            }
                        }
                    }

                    // Apply regular color mappings only if no special rule was applied
                    if (!colorChanged && currentColor in mapping.colorMap) {
                        controlData.status[dancer_id][part_id][0] = mapping.colorMap[currentColor];
                    }
                }
            }
        }
    }
};

// Main execution
if (require.main === module) {
    try {
        const inputPath = path.join(__dirname, "../../../LightTableBackup/2025.03.19.json");
        
        if (!fs.existsSync(inputPath)) {
            throw new Error(`Input file not found: ${inputPath}`);
        }

        const data = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

        applyColorMappings(data);

        const outputPath = path.join(__dirname, "./updatedColor.json");
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log(`✓ Updated data saved to ${outputPath}`);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

module.exports = { applyColorMappings };