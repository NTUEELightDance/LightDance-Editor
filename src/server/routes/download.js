const express = require("express");
const asyncHandler = require("express-async-handler");

const router = express.Router();

// Handle download post

router.post(
  "/",
  asyncHandler(async (req, res) => {
    // Uploaded files
    console.log(req.body);
    res.send("success");
  })
);

module.exports = router;
