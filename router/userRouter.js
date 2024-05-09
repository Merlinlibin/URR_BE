const express = require("express");
const userRouter = express.Router();
const {
  getUser,
  signup,
  login,
  loggedinUser,
  accActivation,
} = require("../controllers/userController");

userRouter.get("/", getUser);
userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.get("/loggedinUser", loggedinUser);
userRouter.put("/activation/:id", accActivation);
module.exports = userRouter;
