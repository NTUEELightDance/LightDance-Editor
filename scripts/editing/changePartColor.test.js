const { changePartColor, updateColor, updateFrameForDancer } = require("./changePartColor");

// Mock data for testing
const createMockData = () => ({
    dancer: [
        {
            name: "0",
            parts: [
                { name: "mask_LED", length: 10 },
                { name: "head", length: 0 },
            ],
        },
        {
            name: "1",
            parts: [
                { name: "arm_LED", length: 8 },
            ],
        },
    ],
    control: {
        frame_0: {
            start: 0,
            status: [
                [
                    ["good_pink", 255],
                    ["good_color", 255],
                ],
                [
                    ["peach_pink", 200],
                ],
            ],
            led_status: [
                [[0, 255], [255, 0]],
                [[100, 100]],
            ],
        },
        frame_1: {
            start: 2500000,
            status: [
                [
                    ["good_Purple", 255],
                    ["good_color", 255],
                ],
                [
                    ["good_pink", 200],
                ],
            ],
            led_status: [
                [[0, 255], [255, 0]],
                [[100, 100]],
            ],
        },
        frame_2: {
            start: 6000000,
            status: [
                [
                    ["good_pink", 255],
                    ["good_color", 255],
                ],
                [
                    ["good_color", 200],
                ],
            ],
            led_status: [
                [[0, 255], [255, 0]],
                [[100, 100]],
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

// Test 1: updateColor function
console.log("\n=== Test 1: updateColor function ===");
const colorMapping = {
    "good_pink": "sky_blue",
    "peach_pink": "sky_blue",
    "good_Purple": "light_blue",
};

assert(
    updateColor(["good_pink", 255], colorMapping)[0] === "sky_blue",
    "good_pink → sky_blue"
);
assert(
    updateColor(["good_pink", 255], colorMapping)[1] === 255,
    "Alpha value preserved"
);
assert(
    updateColor(["good_color", 255], colorMapping)[0] === "good_color",
    "Unmapped colors unchanged"
);

// Test 2: updateFrameForDancer function
console.log("\n=== Test 2: updateFrameForDancer function ===");
const frame = {
    start: 0,
    status: [
        [["good_pink", 255], ["good_color", 255]],
        [["peach_pink", 200]],
    ],
    led_status: [
        [[0, 255], [255, 0]],
        [[100, 100]],
    ],
};

const updatedFrame = updateFrameForDancer(frame, 0, 0, colorMapping);

assert(
    updatedFrame.status[0][0][0] === "sky_blue",
    "Dancer 0, part 0: good_pink → sky_blue"
);
assert(
    updatedFrame.status[0][1][0] === "good_color",
    "Dancer 0, part 1: unchanged"
);
assert(
    updatedFrame.status[1][0][0] === "peach_pink",
    "Dancer 1 not affected"
);

// Test 3: changePartColor with time range
console.log("\n=== Test 3: changePartColor with time range ===");
const testData3 = createMockData();

const result3 = changePartColor(
    testData3,
    0,
    5000000,
    "0",
    "mask_LED",
    colorMapping
);

assert(
    result3.control.frame_0.status[0][0][0] === "sky_blue",
    "Frame 0 (start: 0): good_pink → sky_blue"
);
assert(
    result3.control.frame_1.status[0][0][0] === "light_blue",
    "Frame 1 (start: 2500000): good_Purple → light_blue"
);
assert(
    result3.control.frame_2.status[0][0][0] === "good_pink",
    "Frame 2 (start: 6000000): outside range, unchanged"
);

// Test 4: changePartColor for different dancer
console.log("\n=== Test 4: changePartColor for different dancer ===");
const testData4 = createMockData();

const result4 = changePartColor(
    testData4,
    0,
    5000000,
    "1",
    "arm_LED",
    colorMapping
);

assert(
    result4.control.frame_0.status[1][0][0] === "sky_blue",
    "Dancer 1, part 0 (frame_0): peach_pink → sky_blue (within time range)"
);
assert(
    result4.control.frame_1.status[1][0][0] === "sky_blue",
    "Dancer 1, part 0 (frame_1): good_pink → sky_blue (within time range)"
);
assert(
    result4.control.frame_2.status[1][0][0] === "good_color",
    "Dancer 1, part 0 (frame_2): good_color (outside time range, unchanged)"
);

// Test 5: Error handling - invalid dancer
console.log("\n=== Test 5: Error handling ===");
const testData5 = createMockData();

try {
    changePartColor(testData5, 0, 5000000, "invalid_dancer", "mask_LED", colorMapping);
    console.error("✗ FAIL: Should throw error for invalid dancer");
    process.exit(1);
} catch (error) {
    assert(
        error.message.includes("not found"),
        "Throws error for invalid dancer"
    );
}

try {
    changePartColor(testData5, 0, 5000000, "0", "invalid_part", colorMapping);
    console.error("✗ FAIL: Should throw error for invalid part");
    process.exit(1);
} catch (error) {
    assert(
        error.message.includes("not found"),
        "Throws error for invalid part"
    );
}

// Test 6: LED status cleared for affected dancer
console.log("\n=== Test 6: LED status handling ===");
const testData6 = createMockData();

const result6 = changePartColor(
    testData6,
    0,
    5000000,
    "0",
    "mask_LED",
    colorMapping
);

assert(
    result6.control.frame_0.led_status[0][0].length === 0,
    "LED status cleared for affected dancer part"
);
assert(
    result6.control.frame_0.led_status[1][0] === testData6.control.frame_0.led_status[1][0],
    "LED status unchanged for other dancers"
);

console.log("\n=== All tests passed! ===\n");