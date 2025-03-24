const fs = require('fs');
const path = require('path');

const data = require("./props.json");

for (const [_, controlData] of Object.entries(data.control)) {
    let status = controlData.status;
    for (let j = 0; j < 5; j++) {
        let parts = data.dancer[j].parts;
        for (let k = 0; k < parts.length; k++) {
            if (parts[k].type === "FIBER" && controlData.status[j][k][1] == 200) {
                controlData.status[j][k][1] = 227;
            }
        }
    }
}

fs.writeFileSync(path.join(__dirname, "./props.json"), JSON.stringify(data, null, 0));

console.log("saved to ./props.json");