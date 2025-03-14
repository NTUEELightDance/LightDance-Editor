const fs = require('fs');
const path = require('path');

const data = require("./jsons/exportDataEmpty.json");

for (const [_, controlData] of Object.entries(data.control)) {
    let status = controlData.status;
    for (let j = 0; j < status.length; j++) {
        let parts = data.dancer[j].parts;
        for (let k = 0; k < parts.length; k++) {
            if (parts[k].type === "LED") {
                controlData.status[j][k][1] = 150;
            }
        }
    }
}

fs.writeFileSync(path.join(__dirname, "jsons/exportDataEmptyNew.json"), JSON.stringify(data, null, 2));