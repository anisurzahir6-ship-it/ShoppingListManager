const History = require("../models/History");

const getHistory = async (req, res) => {
  try {
    const history = await History.find({
      userId: req.user.id
    }).sort({ purchasedAt: -1 });

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get purchase history",
      error: error.message
    });
  }
};

module.exports = {
  getHistory
};