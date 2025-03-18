const fs = require('fs');
const path = require('path');

const data = require("../backup/2025.3.16.json");

for (const [_, controlData] of Object.entries(data.control)) {
    let status = controlData.status;
    for (let j = 0; j < 9; j++) {
        let parts = data.dancer[j].parts;
        for (let k = 0; k < parts.length; k++) {
            if (parts[k].type === "LED") {
                controlData.status[j][k][1] = 100;
            }
        }
    }
}

fs.writeFileSync(path.join(__dirname, "changedLEDAlpha.json"), JSON.stringify(data, null, 0));