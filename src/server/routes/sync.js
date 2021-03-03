const express = require("express");
const asyncHandler = require("express-async-handler");

const router = express.Router();

// Handle login post
router.route("/").post(
  asyncHandler((req, res) => {
    console.log(req);
    const { branchName, from, type, mode } = req.body;
    const data = JSON.parse(req.body.data);
    const wss = req.app.get("wss");
    wss.handleSync(JSON.stringify(req.body));
    console.log(type, mode, data);
    res.send({ message: "sync", type, mode, data });
  })
);

module.exports = router;
