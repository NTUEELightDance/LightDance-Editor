


const data = require("../../../LightTableBackup/2025.03.19.json");
const fs = require('fs');
const path = require('path');

for (const [key, controlData] of Object.entries(data.control)) {
    for (let part_id = 0; part_id < 31; part_id++) {
        if (controlData.status[0][part_id][0] === "bad_blue" || controlData.status[0][part_id][0] === "bad_green" || controlData.status[0][part_id][0] === "bad_orange_light_p" || controlData.status[0][part_id][0] === "orange_dark_p") {
            data.control[key].status[0][part_id][0] = "bad_orange_crayola";
        }
    }
    for (let dancer_id = 1; dancer_id < 5; dancer_id++) {
        for (let part_id = 0; part_id < 39; part_id++) {
            if (controlData.status[dancer_id][part_id][0] === "bad_blue" || controlData.status[dancer_id][part_id][0] === "bad_green" || controlData.status[dancer_id][part_id][0] === "bad_orange_light_p" || controlData.status[dancer_id][part_id][0] === "orange_dark_p") {
                data.control[key].status[dancer_id][part_id][0] = "bad_orange_crayola";
            }
            if (controlData.status[dancer_id][part_id][0] === "bad_blur_blue") {
                data.control[key].status[dancer_id][part_id][0] = "bad_red";
            }
            if (controlData.status[dancer_id][35][0] === "bad_orange_crayola") {
                data.control[key].status[dancer_id][35][0] = "bad_red";
            }
        }
    }
    for (let dancer_id = 5; dancer_id < 8; dancer_id++) {
        for (let part_id = 0; part_id < 36; part_id++) {
            if (controlData.status[dancer_id][part_id][0] === "pink") {
                data.control[key].status[dancer_id][part_id][0] = "good_Purple";
            }
        }
    }
}

fs.writeFileSync(path.join(__dirname, "./updatedColor.json"), JSON.stringify(data, null, 2));
console.log("Updated data has been saved to ./updatedColor.json");