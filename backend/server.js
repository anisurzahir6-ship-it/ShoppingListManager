const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const listRoutes = require("./routes/listRoutes");
const itemRoutes = require("./routes/itemRoutes");
const historyRoutes = require("./routes/historyRoutes");
const aiRoutes = require("./routes/aiRoutes");

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/lists", itemRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/ai", aiRoutes);

// Root test route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Shopping List Manager API is running"
  });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});