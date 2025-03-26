const fs = require('fs');
const path = require('path');

const data = require("./props.json");

const addFrame = (start, cat, defaultColorData, secondaryColorData, direction, double, index, LEDindex, startTime) => {
    const previousControl = Object.values(data.control)
        .filter(d => d.start <= start)
        .reduce((prev, curr) => (curr.start > prev.start ? curr : prev), { start: -Infinity });
    const status = JSON.parse(JSON.stringify(previousControl.status)); 
    const led_status = JSON.parse(JSON.stringify(previousControl.led_status)); 

    status[13][0] = ["", 150];
    status[13][1] = ["black", 150];
    status[13][2] = ["", 150];
    status[14][0] = ["", 150];
    status[14][1] = ["black", 150];
    status[14][2] = ["", 150];
    led_status[13][0] = Array(91).fill(defaultColorData);
    led_status[13][2] = Array(90).fill(defaultColorData);
    led_status[14][0] = Array(80).fill(defaultColorData);
    led_status[14][2] = Array(78).fill(defaultColorData);

    for (let i = (start - startTime) * 339 / period; i < (start - startTime) * 339 / period + LEDlength; i++) {
        const bulbIndex = ((direction * Math.round(i)) % 339 + 339) % 339
        if (i >= 0 && i < 80) {
            led_status[14][0][bulbIndex] = secondaryColorData;
        }
        if (i >= 80 && i < 171) {
            led_status[13][0][bulbIndex - 80] = secondaryColorData;
        }
        if (i >= 171 && i < 261) {
            led_status[13][2][bulbIndex - 171] = secondaryColorData;
        }
        if (i >= 261 && i < 339) {
            led_status[13][2][bulbIndex - 261] = secondaryColorData;
        }
        if (double) {
            if (i >= 0 && i < 80) {
                led_status[14][0][(bulbIndex + 339 / 2) % 339] = secondaryColorData;
            }
            if (i >= 80 && i < 171) {
                led_status[13][0][(bulbIndex + 339 / 2) % 339 - 80] = secondaryColorData;
            }
            if (i >= 171 && i < 261) {
                led_status[13][2][(bulbIndex + 339 / 2) % 339 - 171] = secondaryColorData;
            }
            if (i >= 261 && i < 339) {
                led_status[13][2][(bulbIndex + 339 / 2) % 339 - 261] = secondaryColorData;
            }
        }   
    }
    
    const controlData = {
        start,
        fade: previousControl.fade,
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

    status[13][0] = ["", 150];
    status[13][1] = ["black", 150];
    status[13][2] = ["", 150];
    status[14][0] = ["", 150];
    status[14][1] = ["black", 150];
    status[14][2] = ["", 150];
    led_status[13][0] = Array(91).fill(defaultColorData);
    led_status[13][2] = Array(90).fill(defaultColorData);
    led_status[14][0] = Array(80).fill(defaultColorData);
    led_status[14][2] = Array(78).fill(defaultColorData);

    for (let i = (start - startTime) * 339 / period; i < (start - startTime) * 339 / period + LEDlength; i++) {
        const bulbIndex = ((direction * Math.round(i)) % 339 + 339) % 339
        let modulusI =  Math.round((i % 339 + 339) % 339);
        if (modulusI >= 0 && modulusI < 80) {
            led_status[14][0][bulbIndex] = secondaryColorData;
        }
        if (modulusI >= 80 && modulusI < 171) {
            led_status[13][0][91 - bulbIndex + 80] = secondaryColorData;
        }
        if (modulusI >= 171 && modulusI < 261) {
            led_status[13][2][bulbIndex - 171] = secondaryColorData;
        }
        if (modulusI >= 261 && modulusI < 339) {
            led_status[14][2][78 - bulbIndex + 261] = secondaryColorData;
        }
        
        if (double) {
            const bulbIndex = ((direction * Math.round(i + 169)) % 339 + 339) % 339
            modulusI = Math.round(((modulusI + 169) % 339 + 339) % 339);
            if (modulusI >= 0 && modulusI < 80) {
                led_status[14][0][bulbIndex] = secondaryColorData;
            }
            if (modulusI >= 80 && modulusI < 171) {
                led_status[13][0][91 - bulbIndex + 80] = secondaryColorData;
            }
            if (modulusI >= 171 && modulusI < 261) {
                led_status[13][2][bulbIndex - 171] = secondaryColorData;
            }
            if (modulusI >= 261 && modulusI < 339) {
                led_status[14][2][78 - bulbIndex + 261] = secondaryColorData;
            }
        }   
    }
    
    const controlData = {
        ...frame,
        status,
        led_status,
    };

    data.control[key] = controlData;
}

const createBigSpinner = (start, end, period, LEDlength, defaultColorData, secondaryColorData, direction, double, partLength, index, LEDindex) => {
    for (let t = start; t < end; t += (1000 / partLength * LEDlength)) {
        addFrame(Math.round(t), partLength, defaultColorData, secondaryColorData, direction, double, index, LEDindex, start);
    }

    const existingFrames = Object.keys(data.control).filter((key) => data.control[key].start >= start && data.control[key].start <= end);
    existingFrames.forEach((key) => {
        updateFrame(key, data.control[key], partLength, defaultColorData, secondaryColorData, direction, double, index, LEDindex);
    });
}

let period = 1000;
let LEDlength = 20;
let direction = 1;
let double = true;

let partLength = 339
let index = 0
let LEDindex = 0

let startTime = 998;
let endTime =  8500;
let defaultColorData = ["big_orb", 255];
let secondaryColorData = ["big_orb_speed", 255];

createBigSpinner(startTime, endTime, period, LEDlength, defaultColorData, secondaryColorData, direction, double, partLength, index, LEDindex);

startTime = 92133;
endTime =  95395;
defaultColorData = ["good_Purple", 255];
secondaryColorData = ["yellow", 255];

createBigSpinner(startTime, endTime, period, LEDlength, defaultColorData, secondaryColorData, direction, double, partLength, index, LEDindex);

startTime = 153316;
endTime =  159897;
defaultColorData = ["big_orb", 255];
secondaryColorData = ["big_orb_speed", 255];

createBigSpinner(startTime, endTime, period, LEDlength, defaultColorData, secondaryColorData, direction, double, partLength, index, LEDindex);

startTime = 217294;
endTime =  219794;
defaultColorData = ["big_orb_broken", 255];
secondaryColorData = ["big_orb_broken_speed", 255];

createBigSpinner(startTime, endTime, period, LEDlength, defaultColorData, secondaryColorData, direction, double, partLength, index, LEDindex);

startTime = 465262;
endTime =  470000;
period = 4800;
defaultColorData = ["big_orb", 255];
secondaryColorData = ["big_orb_speed", 255];

createBigSpinner(startTime, endTime, period, LEDlength, defaultColorData, secondaryColorData, direction, double, partLength, index, LEDindex);

// fs.writeFileSync(path.join(__dirname, "./../../LightTableBackup/2025.03.17.json"), JSON.stringify(data, null, 0));
fs.writeFileSync(path.join(__dirname, "./props.json"), JSON.stringify(data, null, 0));
console.log(Object.keys(data.control).length)

console.log("Updated data has been saved to ./props.json");