const express = require("express");
// const userRouter = require("./user");
// const courseRouter = require("./course");
const loginRouter = require("./login");
const syncRouter = require("./sync");
// const voteRouter = require("./vote");
// const commentRouter = require("./comment");

const router = express.Router();

// For mainpage to fetch what courses the user followed
// router.use("/user", userRouter);

// // For fetching course infomations
// router.use("/course", courseRouter);

// Handle login post
router.use("/login", loginRouter);

// Handle sync post
router.use("/sync", syncRouter);

// // Handle Vote
// router.use("/vote", voteRouter);

// //Handle comment
// router.use("/comment", commentRouter);

module.exports = router;
