
const express = require('express');
const dbo = require('./database/db');
const authenticateRoutes = require('./routes/auth');
const tasksRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const cors = require("cors");

const router = express.Router();
const app = express();
require("dotenv").config({ path: "./config.env" });

const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
app.use("/api/auth", authenticateRoutes);
app.use("/api/user", userRoutes);
app.use("/api/task", tasksRoutes);




app.listen(port, () => {
  // perform a database connection when server starts
  dbo.connectToServer(function (err) {
    if (err) console.error(err);
   });
  console.log(`Server is running on port: ${port}`);
});

// Register a new user

module.exports = router;
