const fs = require('fs');
const path = require('path');

// const data = require("./../../LightTableBackup/2025.03.17.json");
const data = require("./jsons/exportDataEmpty.json");

const addFrame = (start, cat, defaultColorData, secondaryColorData, direction, double, index, LEDindex, startTime) => {
    const previousControl = Object.values(data.control)
        .filter(d => d.start <= start)
        .reduce((prev, curr) => (curr.start > prev.start ? curr : prev), { start: -Infinity });
    const status = JSON.parse(JSON.stringify(previousControl.status)); 
    const led_status = JSON.parse(JSON.stringify(previousControl.led_status)); 

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
    led_status[25][1] = Array(41).fill(defaultColorData);
    led_status[25][4] = Array(92).fill(defaultColorData);

    for (let i = (start - startTime) * 266 / period; i < (start - startTime) * 266 / period + LEDlength; i++) {
        const bulbIndex = ((direction * Math.round(i)) % 266 + 266) % 266
        let modulusI =  Math.round((i % 266 + 266) % 266);
        if (modulusI >= 0 && modulusI < 41) {
            led_status[24][2][41 - bulbIndex] = secondaryColorData;
        }
        if (modulusI >= 41 && modulusI < 133) {
            led_status[24][1][bulbIndex - 41] = secondaryColorData;
        }
        if (modulusI >= 133 && modulusI < 225) {
            led_status[25][4][bulbIndex - 133] = secondaryColorData;
        }
        if (modulusI >= 225 && modulusI < 266) {
            led_status[25][1][bulbIndex - 225] = secondaryColorData;
        }
        
        if (double) {
            const bulbIndex = ((direction * Math.round(i + 133)) % 266 + 266) % 266
            modulusI = Math.round(((modulusI + 133) % 266 + 266) % 266);
            if (modulusI >= 0 && modulusI < 41) {
                led_status[24][2][41 - bulbIndex] = secondaryColorData;
            }
            if (modulusI >= 41 && modulusI < 133) {
                led_status[24][1][bulbIndex - 41] = secondaryColorData;
            }
            if (modulusI >= 133 && modulusI < 225) {
                led_status[25][4][bulbIndex - 133] = secondaryColorData;
            }
            if (modulusI >= 225 && modulusI < 266) {
                led_status[25][1][bulbIndex - 225] = secondaryColorData;
            }
        }   
    }
    // console.log(led_status[25][1]);
    
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

const updateFrame = (key, frame, dog, defaultColorData, secondaryColorData, direction, double, index, LEDindex) => {
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
    led_status[25][1] = Array(41).fill(defaultColorData);
    led_status[25][4] = Array(92).fill(defaultColorData);

    for (let i = (start - startTime) * 266 / period; i < (start - startTime) * 266 / period + LEDlength; i++) {
        const bulbIndex = ((direction * Math.round(i)) % 266 + 266) % 266
        let modulusI =  Math.round((i % 266 + 266) % 266);
        if (modulusI >= 0 && modulusI < 41) {
            led_status[24][2][41 - bulbIndex] = secondaryColorData;
        }
        if (modulusI >= 41 && modulusI < 133) {
            led_status[24][1][bulbIndex - 41] = secondaryColorData;
        }
        if (modulusI >= 133 && modulusI < 225) {
            led_status[25][4][bulbIndex - 133] = secondaryColorData;
        }
        if (modulusI >= 225 && modulusI < 266) {
            led_status[25][1][bulbIndex - 225] = secondaryColorData;
        }
        
        if (double) {
            const bulbIndex = ((direction * Math.round(i + 133)) % 266 + 266) % 266
            modulusI = Math.round(((modulusI + 133) % 266 + 266) % 266);
            if (modulusI >= 0 && modulusI < 41) {
                led_status[24][2][41 - bulbIndex] = secondaryColorData;
            }
            if (modulusI >= 41 && modulusI < 133) {
                led_status[24][1][bulbIndex - 41] = secondaryColorData;
            }
            if (modulusI >= 133 && modulusI < 225) {
                led_status[25][4][bulbIndex - 133] = secondaryColorData;
            }
            if (modulusI >= 225 && modulusI < 266) {
                led_status[25][1][bulbIndex - 225] = secondaryColorData;
            }
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

const createBigCannon = (start, end, period, LEDlength, defaultColorData, secondaryColorData, direction, double, partLength, index, LEDindex) => {
    for (let t = start; t < end; t += (period / partLength * LEDlength)) {
        addFrame(Math.round(t), partLength, defaultColorData, secondaryColorData, direction, double, index, LEDindex, start);
    }

    const existingFrames = Object.keys(data.control).filter((key) => data.control[key].start >= start && data.control[key].start <= end);
    existingFrames.forEach((key) => {
        updateFrame(key, data.control[key], partLength, defaultColorData, secondaryColorData, direction, double, index, LEDindex);
    });
}

let period = 1874;
let LEDlength = 15;
let direction = 1;
let double = true;

let partLength = 266
let index = 0
let LEDindex = 0

let startTime = 65381;
let endTime =  71287;
let defaultColorData = ["blue", 255];
let secondaryColorData = ["white", 255];

createBigCannon(startTime, endTime, period, LEDlength, defaultColorData, secondaryColorData, direction, double, partLength, index, LEDindex);

// fs.writeFileSync(path.join(__dirname, "./../../LightTableBackup/2025.03.17.json"), JSON.stringify(data, null, 0));
fs.writeFileSync(path.join(__dirname, "./props.json"), JSON.stringify(data, null, 2));

console.log("Updated data has been saved to ./props.json");