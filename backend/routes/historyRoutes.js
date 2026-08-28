const express = require("express");

const { getHistory } = require("../controllers/historyController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getHistory);

module.exports = router;