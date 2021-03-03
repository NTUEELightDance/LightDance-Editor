const express = require("express");
const asyncHandler = require("express-async-handler");

const db = require("../db");

const router = express.Router();

// Handle login post

router.route("/").get(
  asyncHandler(async (req, res) => {
    const { time, branchName } = req.query;
    console.log({ time, branchName });
    const updateData = await db.getCommitToPull(time, branchName);
    res.send({ time, branchName, updateData });
  })
);

module.exports = router;
