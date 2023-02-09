/**
 * node initDB.js
 */
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const filePath = process.argv[2];

const instance = axios.create({
  baseURL: "http://localhost:4000/",
  // baseURL: "http://localhost:8080/",
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

async function main() {
  // const file = fs.createReadStream(filePath);
  const formData = new FormData();
  formData.append("data", fs.createReadStream(filePath));
  const options = {
    headers: Object.assign(
      { "Content-Type": "multipart/form-data" },
      formData.getHeaders()
    ),
  };
  const response = await instance
    .post("/api/uploadData", formData, options)
    // .post("/api/editor-server/uploadData", formData, options)
    .catch(function (error) {
      if (error.response) {
        // Request made and server responded
        console.log(error.response.data);
        console.log(error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
      }
    });
  if (response) {
    console.log(response.status);
  }
}

main();
