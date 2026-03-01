const { deleteFramesInRange } = require("./deleteFrames");

// Mock data for testing
const createMockData = () => ({
    control: {
        frame_0: { start: 400000, data: "control_0" },
        frame_1: { start: 426500, data: "control_1" }, // within range
        frame_2: { start: 430000, data: "control_2" }, // within range
        frame_3: { start: 433600, data: "control_3" }, // within range
        frame_4: { start: 440000, data: "control_4" },
        frame_5: { start: 426000, data: "control_5" }, // at start boundary (not deleted)
        frame_6: { start: 433625, data: "control_6" }, // at end boundary (not deleted)
    },
    position: {
        frame_0: { start: 400000, data: "position_0" },
        frame_1: { start: 426500, data: "position_1" }, // within range
        frame_2: { start: 430000, data: "position_2" }, // within range
        frame_3: { start: 433600, data: "position_3" }, // within range
        frame_4: { start: 440000, data: "position_4" },
        frame_5: { start: 426000, data: "position_5" }, // at start boundary (not deleted)
        frame_6: { start: 433625, data: "position_6" }, // at end boundary (not deleted)
    },
});

// Test utilities
const assert = (condition, message) => {
    if (!condition) {
        console.error(`✗ FAIL: ${message}`);
        process.exit(1);
    }
    console.log(`✓ PASS: ${message}`);
};

// Test 1: Delete control frames in range
console.log("\n=== Test 1: Delete control frames in range ===");
const testData1 = createMockData();

const result1 = deleteFramesInRange(testData1, 426000, 433625, true, false);

assert(
    result1.deletedControlCount === 3,
    "Deleted 3 control frames (426500, 430000, 433600)"
);
assert(
    Object.keys(result1.data.control).length === 4,
    "4 control frames remaining (3 deleted + 2 boundaries + 1 outside)"
);
assert(
    result1.data.control.frame_0.start === 400000,
    "Frame before range preserved"
);
assert(
    result1.data.control.frame_4.start === 440000,
    "Frame after range preserved"
);
assert(
    result1.data.control.frame_5.start === 426000,
    "Frame at start boundary preserved (exclusive)"
);
assert(
    result1.data.control.frame_6.start === 433625,
    "Frame at end boundary preserved (exclusive)"
);

// Test 2: Delete position frames
console.log("\n=== Test 2: Delete position frames ===");
const testData2 = createMockData();

const result2 = deleteFramesInRange(testData2, 426000, 433625, false, true);

assert(
    result2.deletedPositionCount === 3,
    "Deleted 3 position frames"
);
assert(
    result2.deletedControlCount === 0,
    "No control frames deleted"
);
assert(
    Object.keys(result2.data.position).length === 4,
    "4 position frames remaining"
);

// Test 3: Delete both control and position
console.log("\n=== Test 3: Delete both control and position ===");
const testData3 = createMockData();

const result3 = deleteFramesInRange(testData3, 426000, 433625, true, true);

assert(
    result3.deletedControlCount === 3,
    "Deleted 3 control frames"
);
assert(
    result3.deletedPositionCount === 3,
    "Deleted 3 position frames"
);
assert(
    Object.keys(result3.data.control).length === 4,
    "4 control frames remaining"
);
assert(
    Object.keys(result3.data.position).length === 4,
    "4 position frames remaining"
);

// Test 4: Delete neither
console.log("\n=== Test 4: Delete neither ===");
const testData4 = createMockData();

const result4 = deleteFramesInRange(testData4, 426000, 433625, false, false);

assert(
    result4.deletedControlCount === 0,
    "No control frames deleted"
);
assert(
    result4.deletedPositionCount === 0,
    "No position frames deleted"
);
assert(
    Object.keys(result4.data.control).length === 7,
    "All control frames preserved"
);
assert(
    Object.keys(result4.data.position).length === 7,
    "All position frames preserved"
);

// Test 5: Empty range (no frames deleted)
console.log("\n=== Test 5: Empty range ===");
const testData5 = createMockData();

const result5 = deleteFramesInRange(testData5, 427000, 427100, true, false);

assert(
    result5.deletedControlCount === 0,
    "No frames deleted in empty range"
);
assert(
    Object.keys(result5.data.control).length === 7,
    "All control frames preserved"
);

// Test 6: Large range (delete many frames)
console.log("\n=== Test 6: Large range ===");
const testData6 = createMockData();

const result6 = deleteFramesInRange(testData6, 400001, 439999, true, true);

assert(
    result6.deletedControlCount === 5,
    "Deleted 5 control frames (all except boundaries)"
);
assert(
    result6.deletedPositionCount === 5,
    "Deleted 5 position frames (all except boundaries)"
);
assert(
    Object.keys(result6.data.control).length === 2,
    "2 control frames remaining (at boundaries)"
);

// Test 7: Error handling - invalid range
console.log("\n=== Test 7: Error handling ===");
const testData7 = createMockData();

try {
    deleteFramesInRange(testData7, 433625, 426000, true, false);
    console.error("✗ FAIL: Should throw error for invalid range");
    process.exit(1);
} catch (error) {
    assert(
        error.message.includes("Invalid time range"),
        "Throws error when startTime >= endTime"
    );
}

// Test 8: Equal start and end times
console.log("\n=== Test 8: Equal times ===");
const testData8 = createMockData();

try {
    deleteFramesInRange(testData8, 426000, 426000, true, false);
    console.error("✗ FAIL: Should throw error for equal times");
    process.exit(1);
} catch (error) {
    assert(
        error.message.includes("Invalid time range"),
        "Throws error when startTime === endTime"
    );
}

// Test 9: Boundary conditions (exclusive range)
console.log("\n=== Test 9: Boundary conditions ===");
const testData9 = createMockData();

const result9 = deleteFramesInRange(testData9, 426000, 433625, true, false);

assert(
    result9.data.control.frame_5 !== undefined && result9.data.control.frame_5.start === 426000,
    "Frame at start boundary (426000) is preserved"
);
assert(
    result9.data.control.frame_6 !== undefined && result9.data.control.frame_6.start === 433625,
    "Frame at end boundary (433625) is preserved"
);
assert(
    result9.deletedControlCount === 3,
    "Exactly 3 frames deleted (exclusive boundaries)"
);

// Test 10: Original data not modified
console.log("\n=== Test 10: Original data not modified ===");
const testData10 = createMockData();
const originalLength = Object.keys(testData10.control).length;

deleteFramesInRange(testData10, 426000, 433625, true, true);

assert(
    Object.keys(testData10.control).length === originalLength,
    "Original data not modified"
);

console.log("\n=== All tests passed! ===\n");