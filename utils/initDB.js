/**
 * node initDB.js
 */
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const filePath = process.argv[2];

const instance = axios.create({
  baseURL: `http://localhost:4000/`,
});

async function main() {
  const file = fs.createReadStream(filePath);
  const formData = new FormData();
  formData.append("data", fs.createReadStream(filePath));
  var options = {
    headers: Object.assign(
      { "Content-Type": "multipart/form-data" },
      formData.getHeaders()
    ),
  };
  const response = await instance.post("/api/uploadData", formData, options);
  return response.data;
}

main().catch((error) => console.error(error));
