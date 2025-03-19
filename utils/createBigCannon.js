const fs = require('fs');
const path = require('path');

// const data = require("./../../LightTableBackup/2025.03.17.json");
const data = require("./jsons/exportDataEmpty.json");
const { dir } = require('console');

const addFrame = (start) => {
    const previousControl = Object.values(data.control)
        .filter(d => d.start <= start)
        .reduce((prev, curr) => (curr.start > prev.start ? curr : prev), { start: -Infinity });
    const status = JSON.parse(JSON.stringify(previousControl.status)); 
    const led_status = JSON.parse(JSON.stringify(previousControl.led_status)); 
    
    const controlData = {
        start,
        fade: true,
        status,
        led_status,
    };

    const entry = Object.entries(data.control).find(([_, value]) => value.start == start);
    if (entry) {
        const [key, _] = entry;
        data.control[key] = controlData;
        return;
    }

    const maxKey = Math.max(...Object.keys(data.control).map(Number));
    const nextKey = maxKey + 1;
    data.control[nextKey.toString()] = controlData;
}

const updateFrame = (key, frame, defaultColorData, secondaryColorData, direction, double, partLength) => {
    const start = frame.start;
    const status = JSON.parse(JSON.stringify(frame.status)); 
    const led_status = JSON.parse(JSON.stringify(frame.led_status)); 

    status[24][0] = ["black", 150];
    // mid
    status[24][1] = ["", 150];
    // right
    status[24][2] = ["", 150];

    status[25][0] = ["black", 150];
    // left
    status[25][1] = ["", 150];
    status[25][2] = ["black", 150];
    status[25][3] = ["black", 150];
    // mid
    status[25][4] = ["", 150];
    status[25][5] = ["black", 150];
    status[25][6] = ["black", 150];

    led_status[24][1] = Array(92).fill(defaultColorData);
    led_status[24][2] = Array(41).fill(defaultColorData);
    led_status[25][0] = Array(30).fill(defaultColorData);
    led_status[25][2] = Array(30).fill(defaultColorData);
    led_status[25][3] = Array(24).fill(defaultColorData);
    led_status[25][5] = Array(24).fill(defaultColorData);
    led_status[25][1] = Array(41).fill(defaultColorData);
    led_status[25][4] = Array(92).fill(defaultColorData);

    if (direction != 0) {
        for (let i = (start - startTime) * partLength / period; i < (start - startTime) * partLength / period + LEDlength; i++) {
            const bulbIndex = ((direction * Math.round(i)) % partLength + partLength) % partLength
            if (bulbIndex >= 0 && bulbIndex < 41) {
                led_status[24][2][41 - bulbIndex] = secondaryColorData;
            }
            if (bulbIndex >= 41 && bulbIndex < 133) {
                led_status[24][1][bulbIndex - 41] = secondaryColorData;
            }
            if (bulbIndex >= 133 && bulbIndex < 225) {
                led_status[25][4][bulbIndex - 133] = secondaryColorData;
            }
            if (bulbIndex >= 225 && bulbIndex < partLength) {
                led_status[25][1][bulbIndex - 225] = secondaryColorData;
            }
            
            if (double) {
                const bulbIndex = ((direction * Math.round(i + 133)) % partLength + partLength) % partLength
                if (bulbIndex >= 0 && bulbIndex < 41) {
                    led_status[24][2][41 - bulbIndex] = secondaryColorData;
                }
                if (bulbIndex >= 41 && bulbIndex < 133) {
                    led_status[24][1][bulbIndex - 41] = secondaryColorData;
                }
                if (bulbIndex >= 133 && bulbIndex < 225) {
                    led_status[25][4][bulbIndex - 133] = secondaryColorData;
                }
                if (bulbIndex >= 225 && bulbIndex < partLength) {
                    led_status[25][1][bulbIndex - 225] = secondaryColorData;
                }
            }   
        }
    } else {
        // move to middle
        for (let i = (start - startTime) * partLength / period; i < (start - startTime) * partLength / period + LEDlength; i++) {
            const center = 50;
            let bulb1 = ((Math.round(i)) % partLength + partLength) % partLength;
            if (bulb1 >= 0 && bulb1 < 41) {
                led_status[24][2][41 - bulb1] = secondaryColorData;
                led_status[25][1][41 - bulb1] = secondaryColorData;
            }
            if (bulb1 >= 41 && bulb1 < 133) {
                led_status[24][1][bulb1 - 41] = secondaryColorData;
                led_status[25][4][92 - bulb1 + 41] = secondaryColorData;
            }
            let bulb2 = ((Math.round(i)) % partLength + partLength) % partLength;
            if (bulb2 >= 0 && bulb2 < 41) {
                led_status[24][2][41 - bulb2] = secondaryColorData;
                led_status[25][1][41 - bulb2] = secondaryColorData;
            }
            if (bulb2 >= 41 && bulb2 < 133) {
                led_status[24][1][bulb2 - 41] = secondaryColorData;
                led_status[25][4][92 - bulb2 + 41] = secondaryColorData;
            }
        }
    }

    if (direction == 1) {
        status[25][0] = ["", 150];
        status[25][2] = ["", 150];
        status[25][3] = ["", 150];
        status[25][5] = ["", 150];
        partLength = 30
        for (let i = (start - startTime) * partLength / period; i < (start - startTime) * partLength / period + 5; i++) {
            let bulbIndex = ((Math.round(i)) % partLength + partLength) % partLength
            led_status[25][0][bulbIndex] = secondaryColorData;
            led_status[25][2][bulbIndex] = secondaryColorData;
        }
        partLength = 24
        for (let i = (start - startTime) * partLength / period; i < (start - startTime) * partLength / period + 5; i++) {
            let bulbIndex = ((Math.round(i)) % partLength + partLength) % partLength
            led_status[25][3][bulbIndex] = secondaryColorData;
            led_status[25][5][bulbIndex] = secondaryColorData;
        }
    }
    
    const controlData = {
        ...frame,
        fade: true,
        status,
        led_status,
    };

    data.control[key] = controlData;
}

const createBigCannon = (start, end, period, LEDlength, defaultColorData, secondaryColorData, direction, double, partLength) => {
    for (let t = start; t < end; t += (period / partLength * LEDlength)) {
        addFrame(Math.round(t));
    }
    if (direction === "right") {
        direction = -1;
    } else if (direction === "left") {
        direction = 1;
    } else {
        direction = 0;
    }

    const existingFrames = Object.keys(data.control).filter((key) => data.control[key].start >= start && data.control[key].start <= end);
    existingFrames.forEach((key) => {
        updateFrame(key, data.control[key], defaultColorData, secondaryColorData, direction, double, partLength);
    });
}

let period = 1000;
let LEDlength = 15;
// left: 1. right: -1
let direction = "right";
let double = true;

let partLength = 266;

let startTime = 55000;
let endTime =  70000;
let defaultColorData = ["blue", 255];
let secondaryColorData = ["white", 255];

// createBigCannon(startTime, endTime, period, LEDlength, defaultColorData, secondaryColorData, direction, double, partLength);

period = 1000;
LEDlength = 15;
// left: 1. right: -1
direction = "left";
double = true;

partLength = 266;

startTime = 40000;
endTime =  55000;
defaultColorData = ["blue", 255];
secondaryColorData = ["white", 255];

// createBigCannon(startTime, endTime, period, LEDlength, defaultColorData, secondaryColorData, direction, double, partLength);

period = 500;
LEDlength = 15;
// left: 1. right: -1
direction = "mid";

partLength = 133;

startTime = 25000;
endTime =  40000;
defaultColorData = ["blue", 255];
secondaryColorData = ["white", 255];

createBigCannon(startTime, endTime, period, LEDlength, defaultColorData, secondaryColorData, direction, double, partLength);

// fs.writeFileSync(path.join(__dirname, "./../../LightTableBackup/2025.03.17.json"), JSON.stringify(data, null, 0));
fs.writeFileSync(path.join(__dirname, "./props.json"), JSON.stringify(data, null, 2));

console.log("Updated data has been saved to ./props.json");