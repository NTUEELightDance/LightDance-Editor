const fs = require('fs');
const path = require('path');

const data = require("./../../LightTableBackup/2025.03.20.json");
// const data = require("./jsons/exportDataEmpty.json");

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

const updateFrame = (key, frame, defaultColorData, secondaryColorData, direction, double, partLength, startTime, endTime, startPos, endPos) => {
    const start = frame.start;
    const status = JSON.parse(JSON.stringify(frame.status)); 
    const led_status = JSON.parse(JSON.stringify(frame.led_status)); 
    const center = startPos + Math.round((start - startTime) / (endTime - startTime) * (endPos - startPos));

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

    led_status[24][1] = Array(92).fill(defaultColorDataRight);
    led_status[24][2] = Array(41).fill(defaultColorDataRight);
    led_status[25][0] = Array(30).fill(defaultColorDataRight);
    led_status[25][2] = Array(30).fill(defaultColorDataRight);
    led_status[25][3] = Array(24).fill(defaultColorDataRight);
    led_status[25][5] = Array(24).fill(defaultColorDataRight);
    led_status[25][1] = Array(41).fill(defaultColorDataRight);
    led_status[25][4] = Array(92).fill(defaultColorDataRight);

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
                led_status[25][4][92 - bulbIndex + 133] = secondaryColorData;
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
                    led_status[25][4][92 - bulbIndex + 133] = secondaryColorData;
                }
                if (bulbIndex >= 225 && bulbIndex < partLength) {
                    led_status[25][1][bulbIndex - 225] = secondaryColorData;
                }
            }   
        }
    } else {
        // move to middle
        let partLength1 = center;
        for (let i = 0; i < partLength; i++) {
            if (i < center) {
                if (i >= 0 && i < 41) {
                    led_status[24][2][i] = defaultColorDataRight;
                }
                if (i >= 41 && i < 133) {
                    led_status[24][1][i - 41] = defaultColorDataRight;
                }
                if (i >= 133 && i < 225) {
                    led_status[25][4][92 - i + 133] = defaultColorDataRight;
                }
                if (i >= 225 && i < partLength) {
                    led_status[25][1][i - 225] = defaultColorDataRight;
                }
            } else {
                if (i >= 0 && i < 41) {
                    led_status[24][2][i] = defaultColorDataLeft;
                }
                if (i >= 41 && i < 133) {
                    led_status[24][1][i - 41] = defaultColorDataLeft;
                }
                if (i >= 133 && i < 225) {
                    led_status[25][4][92 - i + 133] = defaultColorDataLeft;
                }
                if (i >= 225 && i < partLength) {
                    led_status[25][1][i - 225] = defaultColorDataLeft;
                }
            }
        }
        for (let i = (start - startTime) * partLength1 / period; i < (start - startTime) * partLength1 / period + LEDlength; i++) {
            let bulb1 = ((Math.round(i)) % partLength1 + partLength1) % partLength1
            if (bulb1 >= 0 && bulb1 < 41) {
                led_status[24][2][41 - bulb1] = secondaryColorDataRight;
            }
            if (bulb1 >= 41 && bulb1 < 133) {
                led_status[24][1][bulb1 - 41] = secondaryColorDataRight;
            }
            if (bulb1 >= 133 && bulb1 < 225) {
                led_status[25][4][92 - bulb1 + 133] = secondaryColorDataRight;
            }
            if (bulb1 >= 225 && bulb1 < partLength) {
                led_status[25][1][bulb1 - 225] = secondaryColorDataRight;
            }
        }
        let partLength2 = partLength - center;
        for (let i = (start - startTime) * partLength2 / period; i < (start - startTime) * partLength2 / period + LEDlength; i++) {
            let bulb2 = ((-Math.round(i)) % partLength2 + partLength2) % partLength2 + center
            if (bulb2 >= 0 && bulb2 < 41) {
                led_status[24][2][41 - bulb2] = secondaryColorDataLeft;
            }
            if (bulb2 >= 41 && bulb2 < 133) {
                led_status[24][1][bulb2 - 41] = secondaryColorDataLeft;
            }
            if (bulb2 >= 133 && bulb2 < 225) {
                led_status[25][4][92 - bulb2 + 133] = secondaryColorDataLeft;
            }
            if (bulb2 >= 225 && bulb2 < partLength) {
                led_status[25][1][bulb2 - 225] = secondaryColorDataLeft;
            }
        }
        for (let i = center - 10; i < center + 10; i++) {
            if (i >= 0 && i < 41) {
                led_status[24][2][41 - i] = pulseColorData;
            }
            if (i >= 41 && i < 133) {
                led_status[24][1][i - 41] = pulseColorData;
            }
            if (i >= 133 && i < 225) {
                led_status[25][4][92 - i + 133] = pulseColorData;
            }
            if (i >= 225 && i < partLength) {
                led_status[25][1][i - 225] = pulseColorData;
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

const createBigCannon = (start, end, period, LEDlength, defaultColorData, secondaryColorData, direction, double, partLength, startPos, endPos) => {
    for (let t = start; t < end; t += (period / partLength * LEDlength * 2)) {
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
        updateFrame(key, data.control[key], defaultColorData, secondaryColorData, direction, double, partLength, startTime, endTime, startPos, endPos);
    });
}

let period = 500;
let LEDlength = 15;
// left: 1. right: -1
let direction = "mid";

let partLength = 266;

let startTime = 390007;
let endTime =  391207;

let defaultColorData = []
let defaultColorDataRight = ["blue", 255];
let defaultColorDataLeft = ["black", 255];
let secondaryColorDataRight = ["light_blue", 255];
let secondaryColorDataLeft = ["black", 255];
let pulseColorData = ["light_blue", 255];

let secondaryColorData = []
let double = false;

// createBigCannon(startTime, endTime, period, LEDlength, defaultColorData, secondaryColorData, direction, secondaryColorData, partLength, 0, 266);

period = 500;
LEDlength = 15;
// left: 1. right: -1
direction = "mid";

partLength = 266;

startTime = 391206;
endTime =  392408;

defaultColorData = []
defaultColorDataRight = ["bigmagic_good_1", 255];
defaultColorDataLeft = ["black", 255];
secondaryColorDataRight = ["bigmagic_good_speed_1", 255];
secondaryColorDataLeft = ["black", 255];
pulseColorData = ["bigmagic_good_speed_1", 255];

secondaryColorData = []
double = false;

createBigCannon(startTime, endTime, period, LEDlength, defaultColorData, secondaryColorData, direction, secondaryColorData, partLength, 266, 266);


period = 500;
LEDlength = 15;
// left: 1. right: -1
direction = "mid";

partLength = 266;

startTime = 396007;
endTime =  397207;

defaultColorData = []
defaultColorDataRight = ["black", 255];
defaultColorDataLeft = ["bigmagic_bad_1", 255];
secondaryColorDataRight = ["black", 255];
secondaryColorDataLeft = ["bigmagic_bad_speed_1", 255];
pulseColorData = ["bigmagic_bad_speed_1", 255];

secondaryColorData = []
double = false;

createBigCannon(startTime, endTime, period, LEDlength, defaultColorData, secondaryColorData, direction, secondaryColorData, partLength, 0, 0);


period = 500;
LEDlength = 15;
// left: 1. right: -1
direction = "mid";

partLength = 266;

startTime = 400305;
endTime =  404407;

defaultColorData = []
defaultColorDataRight = ["bigmagic_good_1", 255];
defaultColorDataLeft = ["bigmagic_bad_1", 255];
secondaryColorDataRight = ["bigmagic_good_speed_1", 255];
secondaryColorDataLeft = ["bigmagic_bad_speed_1", 255];
pulseColorData = ["white", 255];

secondaryColorData = []
double = false;

createBigCannon(startTime, endTime, period, LEDlength, defaultColorData, secondaryColorData, direction, secondaryColorData, partLength, 133, 133);

period = 500;
LEDlength = 15;
// left: 1. right: -1
direction = "mid";

partLength = 266;

startTime = 404407;
endTime =  409207;


defaultColorData = []
defaultColorDataRight = ["bigmagic_good_1", 255];
defaultColorDataLeft = ["bigmagic_bad_1", 255];
secondaryColorDataRight = ["bigmagic_good_speed_1", 255];
secondaryColorDataLeft = ["bigmagic_bad_speed_1", 255];
pulseColorData = ["white", 255];

secondaryColorData = []
double = false;

createBigCannon(startTime, endTime, period, LEDlength, defaultColorData, secondaryColorData, direction, secondaryColorData, partLength, 133, 80);

period = 500;
LEDlength = 15;
// left: 1. right: -1
direction = "mid";
defaultColorDataRight = ["baby_blue", 255];
defaultColorDataLeft = ["bigmagic_bad_1", 255];
secondaryColorDataRight = ["white", 255];
secondaryColorDataLeft = ["bigmagic_bad_speed_1", 255];
partLength = 266;

startTime = 409207;
endTime =  411607;


createBigCannon(startTime, endTime, period, LEDlength, defaultColorData, secondaryColorData, direction, double, partLength, 80, 266);

// fs.writeFileSync(path.join(__dirname, "./../../LightTableBackup/2025.03.17.json"), JSON.stringify(data, null, 0));
fs.writeFileSync(path.join(__dirname, "./props.json"), JSON.stringify(data, null, 2));

console.log("Updated data has been saved to ./props.json");