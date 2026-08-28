const express = require("express");

const {
  addItem,
  updateItem,
  deleteItem,
  getItems
} = require("../controllers/itemController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================
// TEST ROUTE - NO LOGIN REQUIRED
// ======================================
router.get("/test/check", (req, res) => {
  console.log("ITEM TEST ROUTE HIT");

  res.status(200).json({
    message: "itemRoutes is working"
  });
});

// ======================================
// LOGIN REQUIRED FOR ALL ROUTES BELOW
// ======================================
router.use(protect);

// GET /api/lists/:id/items
router.get("/:id/items", getItems);

// POST /api/lists/:id/items
router.post("/:id/items", addItem);

// PUT /api/lists/:id/items/:itemId
router.put("/:id/items/:itemId", updateItem);

// DELETE /api/lists/:id/items/:itemId
router.delete("/:id/items/:itemId", deleteItem);

module.exports = router;