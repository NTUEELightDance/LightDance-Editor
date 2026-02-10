/*
 * This script updates FIBER alpha (opacity) values in the database.
 * It changes FIBER parts with alpha value 200 to 227 for the first 5 dancers.
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Configuration
const DANCER_COUNT = 5;
const TARGET_PART_TYPE = "FIBER";
const OLD_ALPHA = 200;
const NEW_ALPHA = 227;

const updateFiberAlphaInDatabase = async () => {
    try {
        // Update all ControlData records where:
        // - The part type is FIBER
        // - The alpha value is OLD_ALPHA
        // - The dancer_id is within the first DANCER_COUNT dancers
        const result = await prisma.controlData.updateMany({
            where: {
                alpha: OLD_ALPHA,
                part: {
                    type: TARGET_PART_TYPE,
                },
                dancer_id: {
                    in: Array.from({ length: DANCER_COUNT }, (_, i) => i + 1),
                },
            },
            data: {
                alpha: NEW_ALPHA,
            },
        });

        console.log(`✓ Updated ${result.count} records in database`);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
};

// Main execution
if (require.main === module) {
    updateFiberAlphaInDatabase();
}

module.exports = { updateFiberAlphaInDatabase };