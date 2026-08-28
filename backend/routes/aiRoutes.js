const express = require("express");

const {
  generateShoppingList
} = require("../controllers/aiController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/generate-list", generateShoppingList);

module.exports = router;