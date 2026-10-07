const fs = require('fs');
const path = require('path');

const file_date = process.argv[2];
const data = require("../../utils/jsons/exportData" + file_date + "_formatted.json");

for (const [_, controlData] of Object.entries(data.control)) {
    let status = controlData.status;
    for (let j = 0; j < data.dancer.length; j++) {
        let parts = data.dancer[j].parts;
        for (let k = 0; k < parts.length; k++) {
            if (parts[k].type === "FIBER") {
                controlData.status[j][k][1] = 255;
            }
            else{
                controlData.status[j][k][1] = 80;
            }
        }
    }
}

const filename = "./exportData" + file_date + "_updatted.json";
const indent = 4;
fs.writeFileSync(path.join("../../utils/jsons", filename), JSON.stringify(data, null, indent));

console.log("saved to " + filename);