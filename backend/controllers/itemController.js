const ListItem = require("../models/ListItem");
const ShoppingList = require("../models/ShoppingList");
const History = require("../models/History");

// Add an item to a shopping list
const addItem = async (req, res) => {
  try {
    const { name, quantity, unit, category } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Item name is required"
      });
    }

    // Check that the list belongs to the logged-in user
    const list = await ShoppingList.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!list) {
      return res.status(404).json({
        message: "Shopping list not found"
      });
    }

    const item = await ListItem.create({
      listId: list._id,
      name,
      quantity: quantity || 1,
      unit: unit || "piece",
      category: category || "Other",
      purchased: false
    });

    res.status(201).json({
      message: "Item added successfully",
      item
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add item",
      error: error.message
    });
  }
};


// Update an item
const updateItem = async (req, res) => {
  try {
    const { name, quantity, unit, category, purchased } = req.body;

    // Find the item
    const item = await ListItem.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({
        message: "Item not found"
      });
    }

    // Check that the list belongs to the logged-in user
    const list = await ShoppingList.findOne({
      _id: item.listId,
      userId: req.user.id
    });

    if (!list) {
      return res.status(403).json({
        message: "Not authorized to update this item"
      });
    }

    // Track whether item is being marked as purchased
    const wasPurchased = item.purchased;

    if (name !== undefined) item.name = name;
    if (quantity !== undefined) item.quantity = quantity;
    if (unit !== undefined) item.unit = unit;
    if (category !== undefined) item.category = category;
    if (purchased !== undefined) item.purchased = purchased;

    await item.save();

    // Add to history when item becomes purchased
    if (!wasPurchased && item.purchased) {
      await History.create({
        userId: req.user.id,
        listId: list._id,
        itemName: item.name,
        quantity: item.quantity,
        purchasedAt: new Date()
      });
    }

    res.status(200).json({
      message: "Item updated successfully",
      item
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update item",
      error: error.message
    });
  }
};


// Delete an item
const deleteItem = async (req, res) => {
  try {
    console.log("DELETE PARAMS:", req.params);
    
    const item = await ListItem.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({
        message: "Item not found"
      });
    }

    // Check list ownership
    const list = await ShoppingList.findOne({
      _id: item.listId,
      userId: req.user.id
    });

    if (!list) {
      return res.status(403).json({
        message: "Not authorized to delete this item"
      });
    }

    await item.deleteOne();

    res.status(200).json({
      message: "Item deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete item",
      error: error.message
    });
  }
};

const getItems = async (req, res) => {
  try {
    const list = await ShoppingList.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!list) {
      return res.status(404).json({
        message: "Shopping list not found"
      });
    }

    const items = await ListItem.find({
      listId: req.params.id
    }).sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch items",
      error: error.message
    });
  }
};

module.exports = {
  addItem,
  updateItem,
  deleteItem,
  getItems
};
