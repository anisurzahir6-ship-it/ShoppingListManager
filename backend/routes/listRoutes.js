const express = require("express");

const {
  createList,
  getLists,
  getListById,
  updateList,
  deleteList
} = require("../controllers/listController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// All shopping list routes require login
router.use(protect);

// GET /api/lists
router.get("/", getLists);

// POST /api/lists
router.post("/", createList);

// GET /api/lists/:id
router.get("/:id", getListById);

// PUT /api/lists/:id
router.put("/:id", updateList);

// DELETE /api/lists/:id
router.delete("/:id", deleteList);

module.exports = router;