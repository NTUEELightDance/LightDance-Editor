const express = require("express");
const asyncHandler = require("express-async-handler");

const db = require("../db");

const router = express.Router();

// Handle login post
router.route("/").post(
  asyncHandler((req, res) => {
    const { branchName, from, type, mode } = req.body;
    const data = JSON.parse(req.body.data);
    const time = Date.now();
    const wss = req.app.get("wss");

    wss.handleSync(JSON.stringify({ ...req.body, time }));
    db.addActionToBranch(branchName, time, from, type, mode, data);
    res.send({
      message: "sync",
      data: { branchName, time, from, type, mode, data },
    });
  })
);

module.exports = router;
