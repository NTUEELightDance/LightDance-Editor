const fs = require('fs');
const path = require('path');

const data = require("./jsons/exportDataEmpty.json");

for (let i = 1; i < Object.keys(data.control).length + 1; i++) {
    let status = data.control[i].status;
    for (let j = 0; j < status.length; j++) {
        let parts = data.dancer[j].parts;
        for (let k = 0; k < parts.length; k++) {
            if (parts[k].type === "LED") {
                data.control[i].status[j][k][1] = 150;
            }
        }
    }
}

fs.writeFileSync(path.join(__dirname, "jsons/exportDataEmptyNew.json"), JSON.stringify(data, null, 2));