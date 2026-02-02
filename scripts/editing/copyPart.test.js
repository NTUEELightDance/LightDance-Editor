const { copyPart, findFrameByStartTime, getFramesInTimeRange } = require("./copyPart");

// Mock data for testing
const createMockData = () => ({
    dancer: [
        {
            name: "0",
            parts: [
                { name: "arm", length: 10 },
                { name: "head", length: 0 },
            ],
        },
        {
            name: "1",
            parts: [
                { name: "leg", length: 8 },
            ],
        },
    ],
    control: {
        frame_0: {
            start: 0,
            status: [
                [["red", 255], ["blue", 255]],
                [["green", 200]],
            ],
            led_status: [
                [[255, 0], [0, 255]],
                [[100, 100]],
            ],
        },
        frame_1: {
            start: 463344,
            status: [
                [["pink", 255], ["yellow", 255]],
                [["orange", 200]],
            ],
            led_status: [
                [[200, 50], [50, 200]],
                [[150, 150]],
            ],
        },
        frame_2: {
            start: 463812,
            status: [
                [["old_color_1", 255], ["old_color_2", 255]],
                [["old_color_3", 200]],
            ],
            led_status: [
                [[10, 20], [30, 40]],
                [[60, 70]],
            ],
        },
        frame_3: {
            start: 500000,
            status: [
                [["old_color_1", 255], ["old_color_2", 255]],
                [["old_color_3", 200]],
            ],
            led_status: [
                [[10, 20], [30, 40]],
                [[60, 70]],
            ],
        },
        frame_4: {
            start: 100000000,
            status: [
                [["old_color_1", 255], ["old_color_2", 255]],
                [["old_color_3", 200]],
            ],
            led_status: [
                [[10, 20], [30, 40]],
                [[60, 70]],
            ],
        },
        frame_5: {
            start: 100000001,
            status: [
                [["should_not_change", 255], ["should_not_change", 255]],
                [["should_not_change", 200]],
            ],
            led_status: [
                [[99, 99], [99, 99]],
                [[99, 99]],
            ],
        },
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

// Test 1: findFrameByStartTime
console.log("\n=== Test 1: findFrameByStartTime ===");
const testData1 = createMockData();

const foundFrame = findFrameByStartTime(testData1.control, 463344);
assert(
    foundFrame && foundFrame.start === 463344,
    "Found frame with start time 463344"
);

const notFound = findFrameByStartTime(testData1.control, 999999);
assert(
    notFound === null,
    "Returns null for non-existent frame"
);

// Test 2: getFramesInTimeRange
console.log("\n=== Test 2: getFramesInTimeRange ===");
const testData2 = createMockData();

const framesInRange = getFramesInTimeRange(testData2.control, 463812, 100000000);
assert(
    framesInRange.length === 3,
    "Found 3 frames in range [463812, 100000000]"
);

const framesOutOfRange = getFramesInTimeRange(testData2.control, 999999, 999999);
assert(
    framesOutOfRange.length === 0,
    "Returns empty array for out-of-range times"
);

// Test 3: copyPart - basic functionality
console.log("\n=== Test 3: copyPart - basic functionality ===");
const testData3 = createMockData();

const result3 = copyPart(testData3, 463344, 463812, 100000000, 0);

assert(
    result3.control.frame_2.status[0][0][0] === "pink",
    "Frame 2, dancer 0, part 0: status copied (old_color_1 → pink)"
);
assert(
    result3.control.frame_2.status[0][1][0] === "yellow",
    "Frame 2, dancer 0, part 1: status copied (old_color_2 → yellow)"
);
assert(
    result3.control.frame_3.status[0][0][0] === "pink",
    "Frame 3, dancer 0, part 0: status copied"
);
assert(
    result3.control.frame_4.status[0][0][0] === "pink",
    "Frame 4, dancer 0, part 0: status copied (end of range)"
);

// Test 4: LED status copied
console.log("\n=== Test 4: LED status copied ===");
const testData4 = createMockData();

const result4 = copyPart(testData4, 463344, 463812, 100000000, 0);

assert(
    JSON.stringify(result4.control.frame_2.led_status[0]) === JSON.stringify([[200, 50], [50, 200]]),
    "Frame 2: LED status copied from source frame"
);
assert(
    JSON.stringify(result4.control.frame_3.led_status[0]) === JSON.stringify([[200, 50], [50, 200]]),
    "Frame 3: LED status copied from source frame"
);

// Test 5: Other dancers not affected
console.log("\n=== Test 5: Other dancers not affected ===");
const testData5 = createMockData();

const result5 = copyPart(testData5, 463344, 463812, 100000000, 0);

assert(
    result5.control.frame_2.status[1][0][0] === "old_color_3",
    "Dancer 1 not affected"
);
assert(
    JSON.stringify(result5.control.frame_2.led_status[1]) === JSON.stringify([[60, 70]]),
    "Dancer 1 LED status not affected"
);

// Test 6: Frames outside range not affected
console.log("\n=== Test 6: Frames outside range not affected ===");
const testData6 = createMockData();

const result6 = copyPart(testData6, 463344, 463812, 100000000, 0);

assert(
    result6.control.frame_0.status[0][0][0] === "red",
    "Frame 0 (before range): not changed"
);
assert(
    result6.control.frame_5.status[0][0][0] === "should_not_change",
    "Frame 5 (after range): not changed"
);

// Test 7: Error handling - invalid source frame
console.log("\n=== Test 7: Error handling ===");
const testData7 = createMockData();

try {
    copyPart(testData7, 999999, 463812, 100000000, 0);
    console.error("✗ FAIL: Should throw error for invalid source frame");
    process.exit(1);
} catch (error) {
    assert(
        error.message.includes("not found"),
        "Throws error for invalid source frame"
    );
}

// Test 8: Error handling - invalid dancer index
console.log("\n=== Test 8: Error handling - invalid dancer ===");
const testData8 = createMockData();

try {
    copyPart(testData8, 463344, 463812, 100000000, 999);
    console.error("✗ FAIL: Should throw error for invalid dancer");
    process.exit(1);
} catch (error) {
    assert(
        error.message.includes("out of range"),
        "Throws error for invalid dancer index"
    );
}

// Test 9: Copy to different dancer
console.log("\n=== Test 9: Copy to different dancer ===");
const testData9 = createMockData();

const result9 = copyPart(testData9, 463344, 463812, 100000000, 1);

assert(
    result9.control.frame_2.status[1][0][0] === "orange",
    "Frame 2, dancer 1: status copied from source dancer 1"
);
assert(
    result9.control.frame_2.status[0][0][0] === "old_color_1",
    "Dancer 0 not affected when copying to dancer 1"
);

console.log("\n=== All tests passed! ===\n");