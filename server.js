const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const userRouter = require("./router/userRouter");

const PORT = process.env.PORT;
const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/user", userRouter);

app.listen(PORT, async () => {
  console.log("Connectin to server");
  await connectDB();
  console.log("Server is running on http://localhost:3000");
});
