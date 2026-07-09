const { merge, generateDefaultLocation } = require("./addNewDancers");

// Mock data for testing
const mockOldData = {
    dancer: [{ model: "dancer1", parts: [] }],
    position: {
        frame_0: {
            location: [[0, 0, 0]],
            rotation: [[0, 0, 0]],
        },
    },
    control: {
        frame_0: {
            status: [[["black", 0]]],
            led_status: [[]],
        },
    },
    color: { red: [255, 0, 0] },
    LEDEffects: {},
};

const mockNewData = {
    dancer: [
        { model: "dancer1", parts: [{ type: "FIBER", name: "head" }] },
        { model: "dancer2", parts: [{ type: "LED", name: "arm", length: 10 }] },
    ],
    position: { frame_0: { location: [], rotation: [] } },
    control: { frame_0: { status: [], led_status: [] } },
    color: { red: [255, 0, 0], blue: [0, 0, 255] },
    LEDEffects: {},
};

// Test 1: generateDefaultLocation
console.log("Test 1: generateDefaultLocation");
const defaultLoc = generateDefaultLocation(mockNewData.dancer);
console.log("✓ Generated locations:", defaultLoc.length === 2 ? "PASS" : "FAIL");

// Test 2: merge function
console.log("\nTest 2: merge function");
const result = merge(mockOldData, mockNewData, defaultLoc);
console.log("✓ Dancers count:", result.dancer.length === 2 ? "PASS" : "FAIL");
console.log("✓ Position extended:", result.position.frame_0.location.length === 2 ? "PASS" : "FAIL");
console.log("✓ LED effects created:", result.LEDEffects.dancer2 ? "PASS" : "FAIL");

console.log("\nAll tests completed!");