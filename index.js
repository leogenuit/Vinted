require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
app.use(cors());
app.use(express.json());

// Connexion à la base de données
mongoose.connect(process.env.MONGODB_URI);

// Import de routes
const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");

app.use(userRoutes, offerRoutes);

app.all("*", (req, res) => {
  console.log("route not found");
  res.status(404).json({ message: "route not found" });
});

app.listen(process.env.PORT, () => {
  console.log("server is running");
});
