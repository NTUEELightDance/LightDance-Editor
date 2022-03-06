import express from "express";

import exportData from "./api/exportData";
import uploadData from "./api/uploadData";
import exportLED from "./api/exportLED";
import uploadLED from "./api/uploadLED";
import exportLogger from "./api/exportLogger";
import getLogger from "./api/getLogger";

const router = express.Router();

router.get("/exportData.json", exportData);
router.post("/uploadData", uploadData);
router.get("/exportLED.json", exportLED);
router.post("/uploadLED", uploadLED);
router.get("/exportLogger.csv", exportLogger);
router.get("/logger", getLogger);

export default router;
