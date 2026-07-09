const { applyColorMappings } = require("./changeDancerColor");

// Mock data for testing
const createMockData = () => ({
    control: {
        frame_0: {
            status: [
                // Index 0 = Dancer 0 (parts 0-30, range is [0, 31])
                [
                    ["bad_blue", 255],
                    ["bad_green", 255],
                    ["bad_orange_light_p", 255],
                    ["orange_dark_p", 255],
                    ["good_color", 255],
                    ...Array(26).fill(["unchanged", 255]),
                ],
                // Index 1 = Dancer 1 (parts 0-38, range is [0, 39])
                [
                    ["bad_blue", 255],
                    ["bad_blur_blue", 255],
                    ["good_color", 255],
                    ...Array(32).fill(["unchanged", 255]),
                    ["bad_orange_crayola", 255], // part 35 - should become bad_red
                    ...Array(3).fill(["unchanged", 255]),
                ],
                // Index 2 = Dancer 2 (parts 0-38, range is [0, 39])
                [
                    ["bad_green", 255],
                    ["unchanged", 255],
                    ...Array(33).fill(["unchanged", 255]),
                    ["bad_orange_crayola", 255], // part 35 - should become bad_red
                    ...Array(3).fill(["unchanged", 255]),
                ],
                // Index 3 = Dancer 3 (parts 0-38, range is [0, 39])
                [
                    ["unchanged", 255],
                    ...Array(34).fill(["unchanged", 255]),
                    ["bad_orange_crayola", 255], // part 35 - should become bad_red
                    ...Array(3).fill(["unchanged", 255]),
                ],
                // Index 4 = Dancer 4 (parts 0-38, range is [0, 39])
                [
                    ["unchanged", 255],
                    ...Array(34).fill(["unchanged", 255]),
                    ["bad_orange_crayola", 255], // part 35 - should become bad_red
                    ...Array(3).fill(["unchanged", 255]),
                ],
                // Index 5 = Dancer 5 (parts 0-35, range is [0, 36])
                [
                    ["pink", 255],
                    ["good_Purple", 255],
                    ...Array(34).fill(["unchanged", 255]),
                ],
            ],
        },
        frame_1: {
            status: [
                // Dancer 0
                [
                    ["bad_blue", 255],
                    ...Array(29).fill(["unchanged", 255]),
                ],
                // Dancer 1
                [
                    ["bad_blur_blue", 255],
                    ...Array(34).fill(["unchanged", 255]),
                    ["bad_orange_crayola", 255], // part 35
                    ...Array(3).fill(["unchanged", 255]),
                ],
                // Dancer 2
                [
                    ["unchanged", 255],
                    ...Array(38).fill(["unchanged", 255]),
                ],
                // Dancer 3
                [
                    ["unchanged", 255],
                    ...Array(38).fill(["unchanged", 255]),
                ],
                // Dancer 4
                [
                    ["unchanged", 255],
                    ...Array(38).fill(["unchanged", 255]),
                ],
                // Dancer 5
                [
                    ["pink", 255],
                    ...Array(35).fill(["unchanged", 255]),
                ],
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

// Test 1: Dancer 0 color fixes
console.log("\n=== Test 1: Dancer 0 color fixes ===");
const testData1 = createMockData();
applyColorMappings(testData1);

assert(
    testData1.control.frame_0.status[0][0][0] === "bad_orange_crayola",
    "Dancer 0, part 0: bad_blue → bad_orange_crayola"
);
assert(
    testData1.control.frame_0.status[0][1][0] === "bad_orange_crayola",
    "Dancer 0, part 1: bad_green → bad_orange_crayola"
);
assert(
    testData1.control.frame_0.status[0][2][0] === "bad_orange_crayola",
    "Dancer 0, part 2: bad_orange_light_p → bad_orange_crayola"
);
assert(
    testData1.control.frame_0.status[0][3][0] === "bad_orange_crayola",
    "Dancer 0, part 3: orange_dark_p → bad_orange_crayola"
);
assert(
    testData1.control.frame_0.status[0][4][0] === "good_color",
    "Dancer 0, part 4: unchanged colors stay the same"
);

// Test 2: Dancer 1-4 color fixes with special rule
console.log("\n=== Test 2: Dancer 1-4 color fixes ===");
const testData2 = createMockData();
applyColorMappings(testData2);

assert(
    testData2.control.frame_0.status[1][0][0] === "bad_orange_crayola",
    "Dancer 1, part 0: bad_blue → bad_orange_crayola"
);
assert(
    testData2.control.frame_0.status[1][1][0] === "bad_red",
    "Dancer 1, part 1: bad_blur_blue → bad_red"
);
assert(
    testData2.control.frame_0.status[1][35][0] === "bad_red",
    "Dancer 1, part 35 (special rule): bad_orange_crayola → bad_red"
);
assert(
    testData2.control.frame_0.status[2][35][0] === "bad_red",
    "Dancer 2, part 35 (special rule): bad_orange_crayola → bad_red"
);
assert(
    testData2.control.frame_0.status[3][35][0] === "bad_red",
    "Dancer 3, part 35 (special rule): bad_orange_crayola → bad_red"
);
assert(
    testData2.control.frame_0.status[4][35][0] === "bad_red",
    "Dancer 4, part 35 (special rule): bad_orange_crayola → bad_red"
);

// Test 3: Dancer 5-7 color fixes
console.log("\n=== Test 3: Dancer 5-7 color fixes ===");
const testData3 = createMockData();
applyColorMappings(testData3);

assert(
    testData3.control.frame_0.status[5][0][0] === "good_Purple",
    "Dancer 5, part 0: pink → good_Purple"
);

// Test 4: Multiple frames processing
console.log("\n=== Test 4: Multiple frames processing ===");
const testData4 = createMockData();
applyColorMappings(testData4);

assert(
    testData4.control.frame_1.status[0][0][0] === "bad_orange_crayola",
    "Frame 1, Dancer 0, part 0: bad_blue → bad_orange_crayola"
);
assert(
    testData4.control.frame_1.status[1][0][0] === "bad_red",
    "Frame 1, Dancer 1, part 0: bad_blur_blue → bad_red"
);
assert(
    testData4.control.frame_1.status[1][35][0] === "bad_red",
    "Frame 1, Dancer 1, part 35 (special rule): bad_orange_crayola → bad_red"
);

// Test 5: Unchanged data remains unchanged
console.log("\n=== Test 5: Unchanged data remains unchanged ===");
const testData5 = createMockData();
const beforeAlpha = testData5.control.frame_0.status[0][4][1];
applyColorMappings(testData5);
const afterAlpha = testData5.control.frame_0.status[0][4][1];

assert(
    beforeAlpha === afterAlpha,
    "Alpha values should not be modified"
);
assert(
    testData5.control.frame_0.status[0][4][0] === "good_color",
    "Unmapped colors should remain unchanged"
);

console.log("\n=== All tests passed! ===\n");