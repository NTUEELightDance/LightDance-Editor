
const data = require("./.json");

for (const key of Object.keys(data.control)) {
    data.control[key].start += 1000000;
}

for (const key of Object.keys(data.position)) {
    data.position[key].start += 1000000;
}

for (const key of Object.keys(data.control)) {
    if (data.control[key].start >= 1000000 && data.control[key].start <= 1001000) {
        data.control[key].start -= 1000000;
    }
}

for (const key of Object.keys(data.position)) {
    if (data.position[key].start >= 1000000 && data.position[key].start <= 1001000) {
        data.position[key].start -= 1000000;
    }
}

for (const key of Object.keys(data.control)) {
    if (data.control[key].start >= 1061912 && data.control[key].start <= 1065662) {
        data.control[key].start -= 1000000;
    }
}

for (const key of Object.keys(data.control)) {
    if (data.control[key].start >= 1085500 && data.control[key].start <= 1087500) {
        data.control[key].start -= 1000000;
    }
}

for (const key of Object.keys(data.control)) {
    if (data.control[key].start >= 1088631 && data.control[key].start <= 1139568) {
        data.control[key].start -= 990506;
    }
}

for (const key of Object.keys(data.position)) {
    if (data.position[key].start >= 1088631 && data.position[key].start <= 1139568) {
        data.position[key].start -= 990506;
    }
}

for (const key of Object.keys(data.control)) {
    if (data.control[key].start >= 1148064 && data.control[key].start <= 1262130) {
        data.control[key].start -= 932136;
    }
}

for (const key of Object.keys(data.position)) {
    if (data.position[key].start >= 1148064 && data.position[key].start <= 1262130) {
        data.position[key].start -= 932136;
    }
}

for (const key of Object.keys(data.control)) {
    if (data.control[key].start >= 1337522 && data.control[key].start <= 1363332) {
        data.control[key].start -= 1001515;
    }
}

for (const key of Object.keys(data.position)) {
    if (data.position[key].start >= 1337522 && data.position[key].start <= 1363332) {
        data.position[key].start -= 1001515;
    }
}

for (const key of Object.keys(data.control)) {
    if (data.control[key].start >= 1438698) {
        data.control[key].start -= 1067891;
    }
}


for (const key of Object.keys(data.control)) {
    if (data.control[key].start > 1000000) {
        delete data.control[key];
    }
}

for (const key of Object.keys(data.position)) {
    if (data.position[key].start > 1000000) {
        delete data.position[key];
    }
}

// save data
const fs = require("fs");

fs.writeFileSync("./new.json", JSON.stringify(data, null, 0));
console.log("Data saved to 'new.json' successfully!!");