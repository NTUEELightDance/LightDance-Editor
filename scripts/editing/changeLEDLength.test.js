const { changeLEDLength } = require("./changeLEDLength");

// Mock data for testing
const createMockData = () => ({
    dancer: [
        {
            model: "dancer1",
            parts: [
                { type: "LED", name: "arm", length: 10 },
                { type: "FIBER", name: "head", length: 0 },
            ],
        },
        {
            model: "dancer2",
            parts: [
                { type: "LED", name: "leg", length: 8 },
            ],
        },
    ],
    control: {
        frame_0: {
            led_status: [
                [
                    [[0, 255], [255, 0], [255, 0], [255, 0], [255, 0], [255, 0], [255, 0], [255, 0], [255, 0], [255, 0]], // LED arm, length 10
                    [], // FIBER head
                ],
                [
                    [[0, 255], [255, 0], [255, 0], [255, 0], [255, 0], [255, 0], [255, 0], [255, 0]], // LED leg, length 8
                ],
            ],
        },
        frame_1: {
            led_status: [
                [
                    [[100, 200], [200, 100], [200, 100], [200, 100], [200, 100], [200, 100], [200, 100], [200, 100], [200, 100], [200, 100]], // LED arm, length 10
                    [],
                ],
                [
                    [[100, 200], [200, 100], [200, 100], [200, 100], [200, 100], [200, 100], [200, 100], [200, 100]], // LED leg, length 8
                ],
            ],
        },
    },
    LEDEffects: {
        dancer1: {
            arm: {
                red: {
                    repeat: 0,
                    frames: [
                        {
                            LEDs: [
                                [255, 0],
                                [255, 0],
                                [255, 0],
                                [255, 0],
                                [255, 0],
                                [255, 0],
                                [255, 0],
                                [255, 0],
                                [255, 0],
                                [255, 0],
                            ],
                            start: 0,
                            fade: false,
                        },
                    ],
                },
            },
        },
        dancer2: {
            leg: {
                blue: {
                    repeat: 0,
                    frames: [
                        {
                            LEDs: [[0, 255], [0, 255], [0, 255], [0, 255], [0, 255], [0, 255], [0, 255], [0, 255]],
                            start: 0,
                            fade: false,
                        },
                    ],
                },
            },
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

// Test 1: Extend LED length
console.log("\n=== Test 1: Extend LED length (10 → 15) ===");
const testData1 = createMockData();
const newData1 = createMockData();
newData1.dancer[0].parts[0].length = 15;
newData1.dancer[1].parts[0].length = 12;

changeLEDLength(testData1, newData1);

assert(
    testData1.dancer[0].parts[0].length === 15,
    "Dancer 1, arm: LED length updated to 15"
);
assert(
    testData1.control.frame_0.led_status[0][0].length === 15,
    "Dancer 1, frame 0: LED status extended to 15"
);
assert(
    testData1.control.frame_1.led_status[0][0].length === 15,
    "Dancer 1, frame 1: LED status extended to 15"
);
assert(
    testData1.LEDEffects.dancer1.arm.red.frames[0].LEDs.length === 15,
    "LED effect extended to 15"
);
assert(
    testData1.LEDEffects.dancer1.arm.red.frames[0].LEDs[14][0] === 255,
    "Extended LEDs filled with last LED value"
);

// Test 2: Truncate LED length
console.log("\n=== Test 2: Truncate LED length (10 → 5) ===");
const testData2 = createMockData();
const newData2 = createMockData();
newData2.dancer[0].parts[0].length = 5;
newData2.dancer[1].parts[0].length = 4;

changeLEDLength(testData2, newData2);

assert(
    testData2.dancer[0].parts[0].length === 5,
    "Dancer 1, arm: LED length updated to 5"
);
assert(
    testData2.control.frame_0.led_status[0][0].length === 5,
    "Dancer 1, frame 0: LED status truncated to 5"
);
assert(
    testData2.control.frame_1.led_status[0][0].length === 5,
    "Dancer 1, frame 1: LED status truncated to 5"
);
assert(
    testData2.LEDEffects.dancer1.arm.red.frames[0].LEDs.length === 5,
    "LED effect truncated to 5"
);

// Test 3: Unchanged LED length
console.log("\n=== Test 3: Unchanged LED length (10 → 10) ===");
const testData3 = createMockData();
const newData3 = createMockData();

const originalStatus = JSON.stringify(testData3.control.frame_0.led_status[0][0]);
changeLEDLength(testData3, newData3);
const modifiedStatus = JSON.stringify(testData3.control.frame_0.led_status[0][0]);

assert(
    testData3.dancer[0].parts[0].length === 10,
    "Dancer 1, arm: LED length remains 10"
);
assert(
    originalStatus === modifiedStatus,
    "LED status unchanged when length is same"
);

// Test 4: Empty LED status not modified
console.log("\n=== Test 4: Empty LED status handling ===");
const testData4 = createMockData();
testData4.control.frame_0.led_status[0][1] = []; // FIBER has empty array
const newData4 = createMockData();
newData4.dancer[0].parts[1].length = 100; // Change length

changeLEDLength(testData4, newData4);

assert(
    testData4.control.frame_0.led_status[0][1].length === 0,
    "Empty LED status remains empty"
);

// Test 5: Multiple dancers with LED changes
console.log("\n=== Test 5: Multiple dancers updated ===");
const testData5 = createMockData();
const newData5 = createMockData();
newData5.dancer[0].parts[0].length = 12;
newData5.dancer[1].parts[0].length = 10;

changeLEDLength(testData5, newData5);

assert(
    testData5.dancer[0].parts[0].length === 12,
    "Dancer 1 LED length updated"
);
assert(
    testData5.dancer[1].parts[0].length === 10,
    "Dancer 2 LED length updated"
);
assert(
    testData5.control.frame_0.led_status[0][0].length === 12,
    "Dancer 1 LED status updated"
);
assert(
    testData5.control.frame_0.led_status[1][0].length === 10,
    "Dancer 2 LED status updated"
);

console.log("\n=== All tests passed! ===\n");