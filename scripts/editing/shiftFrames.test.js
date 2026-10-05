const { shiftFramesInRange, applyMultipleShifts } = require("./shiftFrames");

// Mock data for testing
const createMockData = () => ({
    control: {
        frame_0: { start: 50000, data: "control_0" },
        frame_1: { start: 100000, data: "control_1" }, // shift +3750
        frame_2: { start: 120000, data: "control_2" }, // shift +3750
        frame_3: { start: 157289, data: "control_3" }, // boundary
        frame_4: { start: 180000, data: "control_4" }, // shift +7294
        frame_5: { start: 215928, data: "control_5" }, // boundary
        frame_6: { start: 250000, data: "control_6" }, // shift +10050
        frame_7: { start: 336007, data: "control_7" }, // boundary
        frame_8: { start: 500000, data: "control_8" }, // shift +12857
        frame_9: { start: 6000000, data: "control_9" }, // boundary
        frame_10: { start: 7000000, data: "control_10" },
    },
    position: {
        frame_0: { start: 50000, data: "position_0" },
        frame_1: { start: 100000, data: "position_1" }, // shift +3750
        frame_2: { start: 120000, data: "position_2" }, // shift +3750
        frame_3: { start: 157289, data: "position_3" }, // boundary
        frame_4: { start: 180000, data: "position_4" }, // shift +7294
        frame_5: { start: 215928, data: "position_5" }, // boundary
        frame_6: { start: 250000, data: "position_6" }, // shift +10050
        frame_7: { start: 336007, data: "position_7" }, // boundary
        frame_8: { start: 500000, data: "position_8" }, // shift +12857
        frame_9: { start: 6000000, data: "position_9" }, // boundary
        frame_10: { start: 7000000, data: "position_10" },
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

// Test 1: shiftFramesInRange - basic shift
console.log("\n=== Test 1: shiftFramesInRange - basic shift ===");
const testData1 = createMockData();

const result1 = shiftFramesInRange(testData1.control, 98125, 157289, 3750);

assert(
    result1.shiftedCount === 2,
    "Shifted 2 frames (100000, 120000)"
);
assert(
    result1.frames.frame_1.start === 103750,
    "Frame 1: 100000 + 3750 = 103750"
);
assert(
    result1.frames.frame_2.start === 123750,
    "Frame 2: 120000 + 3750 = 123750"
);
assert(
    result1.frames.frame_0.start === 50000,
    "Frame 0 (before range): unchanged"
);
assert(
    result1.frames.frame_3.start === 157289,
    "Frame 3 (at boundary): unchanged (exclusive)"
);

// Test 2: Boundary conditions (exclusive range)
console.log("\n=== Test 2: Boundary conditions ===");
const testData2 = createMockData();

const result2 = shiftFramesInRange(testData2.control, 98125, 157289, 3750);

assert(
    result2.frames.frame_1.start === 103750,
    "Frame with start 100000 (> 98125) shifted"
);
assert(
    result2.frames.frame_3.start === 157289,
    "Frame with start 157289 (not < 157289) not shifted"
);

// Test 3: Negative shift
console.log("\n=== Test 3: Negative shift ===");
const testData3 = createMockData();

const result3 = shiftFramesInRange(testData3.control, 98125, 157289, -1000);

assert(
    result3.shiftedCount === 2,
    "Shifted 2 frames with negative shift"
);
assert(
    result3.frames.frame_1.start === 99000,
    "Frame 1: 100000 - 1000 = 99000"
);

// Test 4: Zero shift
console.log("\n=== Test 4: Zero shift ===");
const testData4 = createMockData();

const result4 = shiftFramesInRange(testData4.control, 98125, 157289, 0);

assert(
    result4.shiftedCount === 2,
    "Still counts frames even with 0 shift"
);
assert(
    result4.frames.frame_1.start === 100000,
    "Frame unchanged with 0 shift"
);

// Test 5: Empty range (no frames to shift)
console.log("\n=== Test 5: Empty range ===");
const testData5 = createMockData();

const result5 = shiftFramesInRange(testData5.control, 130000, 140000, 1000);

assert(
    result5.shiftedCount === 0,
    "No frames shifted in empty range"
);

// Test 6: Multiple shifts applied sequentially
console.log("\n=== Test 6: Multiple shifts applied sequentially ===");
const testData6 = createMockData();

const shifts = [
    { startTime: 98125, endTime: 157289, shift: 3750 },
    { startTime: 157289, endTime: 215928, shift: 7294 },
];

const result6 = applyMultipleShifts(testData6, shifts);

// Frame 1 was shifted by 3750 in first operation
assert(
    result6.data.control.frame_1.start === 103750,
    "First shift applied"
);
// Frame 4 was shifted by 7294 in second operation
assert(
    result6.data.control.frame_4.start === 187294,
    "Second shift applied"
);
assert(
    result6.results.length === 2,
    "Results recorded for 2 shifts"
);

// Test 7: Overlapping shifts
console.log("\n=== Test 7: Overlapping shifts ===");
const testData7 = createMockData();

const shifts7 = [
    { startTime: 98125, endTime: 200000, shift: 5000 },
    { startTime: 150000, endTime: 250000, shift: 3000 },
];

const result7 = applyMultipleShifts(testData7, shifts7);

// Frame 2 (start: 120000)
// First shift: 120000 + 5000 = 125000
// Second shift: 125000 (not in 150000-250000 range, so no second shift)
assert(
    result7.data.control.frame_2.start === 125000,
    "Frame 2 shifted by first operation only"
);
// Frame 4 (start: 180000)
// First shift: 180000 + 5000 = 185000
// Second shift: 185000 + 3000 = 188000
assert(
    result7.data.control.frame_4.start === 188000,
    "Frame 4 shifted by both operations"
);

// Test 8: Error handling - invalid range
console.log("\n=== Test 8: Error handling - invalid range ===");
const testData8 = createMockData();

try {
    shiftFramesInRange(testData8.control, 157289, 98125, 1000);
    console.error("✗ FAIL: Should throw error for invalid range");
    process.exit(1);
} catch (error) {
    assert(
        error.message.includes("Invalid time range"),
        "Throws error when startTime >= endTime"
    );
}

// Test 9: Position frames also shifted
console.log("\n=== Test 9: Position frames also shifted ===");
const testData9 = createMockData();

const shifts9 = [
    { startTime: 98125, endTime: 157289, shift: 3750 },
];

const result9 = applyMultipleShifts(testData9, shifts9);

assert(
    result9.data.position.frame_1.start === 103750,
    "Position frame 1 shifted"
);
assert(
    result9.data.position.frame_2.start === 123750,
    "Position frame 2 shifted"
);
assert(
    result9.results[0].positionShifted === 2,
    "Results show 2 position frames shifted"
);

// Test 10: Original data not modified
console.log("\n=== Test 10: Original data not modified ===");
const testData10 = createMockData();
const originalStart = testData10.control.frame_1.start;

const shifts10 = [
    { startTime: 98125, endTime: 157289, shift: 3750 },
];

applyMultipleShifts(testData10, shifts10);

assert(
    testData10.control.frame_1.start === originalStart,
    "Original data not modified"
);

console.log("\n=== All tests passed! ===\n");