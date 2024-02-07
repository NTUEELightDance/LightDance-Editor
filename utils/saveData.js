/**
 * node saveData.js
 */
const axios = require("axios");
const fs = require("fs");

const filePath = process.argv[2];

const instance = axios.create({
  baseURL: "http://localhost:4000/",
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

async function main() {
  const file = fs.createWriteStream(filePath);

  const response = await instance.get("/api/exportData");
  //   console.log(response.data)
  if (response.status === 200) {
    file.write(JSON.stringify(response.data, null, 2));
    console.log(`Data saved to '${filePath}' successfully!!`);
  }
  file.close();
}

main().catch((error) => console.error(error));
