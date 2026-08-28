const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShoppingList",
      required: true
    },

    itemName: {
      type: String,
      required: true
    },

    quantity: {
      type: Number,
      default: 1
    },

    purchasedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("History", historySchema);