const fs = require('fs');
const path = require('path');

const data = require("./props.json");
console.log(Object.keys(data.control).length)

let copyFrame = Object.entries(data.control).find(([_, value]) => value.start == 463344)[1];
let copyLEDStatus = copyFrame.led_status[0];
let copyStatus = copyFrame.status[0];
let start = 463812;
let end = 100000000;


let existingFrames = Object.keys(data.control).filter((key) => data.control[key].start >= start && data.control[key].start <= end);
existingFrames.forEach((key) => {
    data.control[key].status[0] = copyStatus;
    data.control[key].led_status[0] = copyLEDStatus
});
 

fs.writeFileSync(path.join(__dirname, "./props.json"), JSON.stringify(data, null, 0));
console.log(Object.keys(data.control).length)
console.log("saved to ./props.json")