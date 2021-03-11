const express = require("express");
const fs = require("fs");

// const loginRouter = require("./login");
// const syncRouter = require("./sync");
// const fetchRouter = require("./fetch");
// const branchRouter = require("./branch");
// const registerRouter = require("./register");
const uploadRouter = require("./upload");
const downloadRouter = require("./download");

// import rpi socket api
// const routerSocket = require("routerSocket")

const router = express.Router();

// // Handle register post
// router.use("/register", registerRouter);

// // Handle login post
// router.use("/login", loginRouter);

// // Handle sync post
// router.use("/sync", syncRouter);

// // Handle fetcg get
// router.use("/fetch", fetchRouter);

// // Handle fetcg get
// router.use("/branch", branchRouter);

// Handle fetcg get
router.use("/upload", uploadRouter);

// Handle fetcg get
router.use("/download", downloadRouter);

module.exports = router;
