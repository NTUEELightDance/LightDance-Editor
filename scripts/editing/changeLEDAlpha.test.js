const { updateFiberAlpha } = require("./changeLEDAlpha");

// Mock data for testing
const createMockData = () => ({
    dancer: [
        {
            parts: [
                { type: "FIBER", name: "head" },
                { type: "FIBER", name: "arm" },
                { type: "LED", name: "hand" },
                { type: "FIBER", name: "leg" },
            ],
        },
        {
            parts: [
                { type: "FIBER", name: "head" },
                { type: "LED", name: "arm" },
            ],
        },
        {
            parts: [
                { type: "FIBER", name: "head" },
            ],
        },
        {
            parts: [
                { type: "FIBER", name: "torso" },
            ],
        },
        {
            parts: [
                { type: "FIBER", name: "head" },
            ],
        },
    ],
    control: {
        frame_0: {
            status: [
                // Dancer 0
                [
                    [255, 200], // FIBER, alpha 200 → should change to 227
                    [255, 200], // FIBER, alpha 200 → should change to 227
                    [255, 200], // LED, alpha 200 → should NOT change
                    [255, 100], // FIBER, alpha 100 → should NOT change
                ],
                // Dancer 1
                [
                    [255, 200], // FIBER, alpha 200 → should change to 227
                    [255, 200], // LED, alpha 200 → should NOT change
                ],
                // Dancer 2
                [
                    [255, 200], // FIBER, alpha 200 → should change to 227
                ],
                // Dancer 3
                [
                    [255, 200], // FIBER, alpha 200 → should change to 227
                ],
                // Dancer 4
                [
                    [255, 200], // FIBER, alpha 200 → should change to 227
                ],
            ],
        },
        frame_1: {
            status: [
                // Dancer 0
                [
                    [255, 200], // FIBER, alpha 200 → should change to 227
                    [255, 150], // FIBER, alpha 150 → should NOT change
                    [255, 200], // LED, alpha 200 → should NOT change
                    [255, 200], // FIBER, alpha 200 → should change to 227
                ],
                // Dancer 1
                [
                    [255, 200], // FIBER, alpha 200 → should change to 227
                    [255, 200], // LED, alpha 200 → should NOT change
                ],
                // Dancer 2-4 similar
                [[255, 200]],
                [[255, 200]],
                [[255, 200]],
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

// Test 1: FIBER parts with alpha 200 are updated
console.log("\n=== Test 1: FIBER alpha 200 → 227 ===");
const testData1 = createMockData();
updateFiberAlpha(testData1);

assert(
    testData1.control.frame_0.status[0][0][1] === 227,
    "Dancer 0, part 0 (FIBER): alpha 200 → 227"
);
assert(
    testData1.control.frame_0.status[0][1][1] === 227,
    "Dancer 0, part 1 (FIBER): alpha 200 → 227"
);
assert(
    testData1.control.frame_0.status[1][0][1] === 227,
    "Dancer 1, part 0 (FIBER): alpha 200 → 227"
);

// Test 2: LED parts are NOT updated
console.log("\n=== Test 2: LED parts unchanged ===");
const testData2 = createMockData();
updateFiberAlpha(testData2);

assert(
    testData2.control.frame_0.status[0][2][1] === 200,
    "Dancer 0, part 2 (LED): alpha 200 should remain unchanged"
);
assert(
    testData2.control.frame_0.status[1][1][1] === 200,
    "Dancer 1, part 1 (LED): alpha 200 should remain unchanged"
);

// Test 3: FIBER parts with different alpha are NOT updated
console.log("\n=== Test 3: FIBER with different alpha unchanged ===");
const testData3 = createMockData();
updateFiberAlpha(testData3);

assert(
    testData3.control.frame_0.status[0][3][1] === 100,
    "Dancer 0, part 3 (FIBER): alpha 100 should remain unchanged"
);
assert(
    testData3.control.frame_1.status[0][1][1] === 150,
    "Dancer 0, part 1 (FIBER): alpha 150 should remain unchanged"
);

// Test 4: Multiple frames processed
console.log("\n=== Test 4: Multiple frames processed ===");
const testData4 = createMockData();
updateFiberAlpha(testData4);

assert(
    testData4.control.frame_1.status[0][0][1] === 227,
    "Frame 1, Dancer 0, part 0 (FIBER): alpha 200 → 227"
);
assert(
    testData4.control.frame_1.status[0][3][1] === 227,
    "Frame 1, Dancer 0, part 3 (FIBER): alpha 200 → 227"
);

// Test 5: All dancers processed
console.log("\n=== Test 5: All dancers processed ===");
const testData5 = createMockData();
updateFiberAlpha(testData5);

for (let i = 0; i < 5; i++) {
    assert(
        testData5.control.frame_0.status[i][0][1] === 227,
        `Dancer ${i}, part 0 (FIBER): alpha 200 → 227`
    );
}

// Test 6: Color values unchanged
console.log("\n=== Test 6: Color values unchanged ===");
const testData6 = createMockData();
const beforeColor = testData6.control.frame_0.status[0][0][0];
updateFiberAlpha(testData6);
const afterColor = testData6.control.frame_0.status[0][0][0];

assert(
    beforeColor === afterColor,
    "Color values should not be modified"
);

console.log("\n=== All tests passed! ===\n");