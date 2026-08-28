const mongoose = require("mongoose");

const listItemSchema = new mongoose.Schema(
  {
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShoppingList",
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1
    },

    unit: {
      type: String,
      default: "piece"
    },

    category: {
      type: String,
      default: "Other"
    },

    purchased: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ListItem", listItemSchema);