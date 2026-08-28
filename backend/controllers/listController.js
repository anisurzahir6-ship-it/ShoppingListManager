const ShoppingList = require("../models/ShoppingList");

// Create a shopping list
const createList = async (req, res) => {
  try {
    const { name, description, isRecurring } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "List name is required"
      });
    }

    const list = await ShoppingList.create({
      userId: req.user.id,
      name,
      description: description || "",
      isRecurring: isRecurring || false
    });

    res.status(201).json({
      message: "Shopping list created successfully",
      list
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create shopping list",
      error: error.message
    });
  }
};


// Get all lists belonging to logged-in user
const getLists = async (req, res) => {
  try {
    const lists = await ShoppingList.find({
      userId: req.user.id
    }).sort({ createdAt: -1 });

    res.status(200).json(lists);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get shopping lists",
      error: error.message
    });
  }
};


// Get one shopping list
const getListById = async (req, res) => {
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

    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get shopping list",
      error: error.message
    });
  }
};


// Update a shopping list
const updateList = async (req, res) => {
  try {
    const { name, description, isRecurring } = req.body;

    const list = await ShoppingList.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!list) {
      return res.status(404).json({
        message: "Shopping list not found"
      });
    }

    if (name !== undefined) {
      list.name = name;
    }

    if (description !== undefined) {
      list.description = description;
    }

    if (isRecurring !== undefined) {
      list.isRecurring = isRecurring;
    }

    await list.save();

    res.status(200).json({
      message: "Shopping list updated successfully",
      list
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update shopping list",
      error: error.message
    });
  }
};


// Delete a shopping list
const deleteList = async (req, res) => {
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

    await list.deleteOne();

    res.status(200).json({
      message: "Shopping list deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete shopping list",
      error: error.message
    });
  }
};


module.exports = {
  createList,
  getLists,
  getListById,
  updateList,
  deleteList
};