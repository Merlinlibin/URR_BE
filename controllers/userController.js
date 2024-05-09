const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const getUser = async (req, res) => {
  const users = await User.find();
  res.send({ users, message: "user fetched successfully" });
};
const signup = async (req, res) => {
  try {
    const { name, email, phone, address, password, pic } = req.body;
    const activationUrl = "http://localhost:5173/user/activation/";

    const userExist = await User.findOne({ email });

    if (userExist)
      return res.status(400).send({ message: "Email is already taken." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      pic,
    });

    if (user) {
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "merlinlibinmerlin@gmail.com",
          pass: "gtpvydtmshtlkjdi",
        },
      });

      var mailOptions = {
        from: "activation@urr.com",
        to: email,
        subject: "Email to Activate your Account",
        text: `
            Hi ${email.split("@")[0]},

            There was a request to activate account on URR!

            If you did not make this request then please ignore this email.

            Otherwise, please click this link to activate your account: ${
              activationUrl + user._id
            } .
            `,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      return res.status(201).send({
        message: "User Created successfully",
      });
    } else {
      return res.status(400).send({ error: "Failed to create user" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Failed  to connect" });
  }
};
const accActivation = async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id);

  if (!user) {
    return res
      .status(404)
      .send({ message: "user havent registered please signup" });
  }
  if (user.isActivated) {
    return res
      .status(400)
      .send({ message: "user alreadt activated please login" });
  }
  try {
    user.isActivated = true;
    await user.save();
    res.status(200).send({ message: "User activated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      if (!user.isActivated)
        return res.status(400).json({
          message: "User Account not activated",
        });
      const isAuthenticated = await bcrypt.compare(password, user.password);

      if (!isAuthenticated) {
        return res.status(400).json({
          message: "password is incorrect",
        });
      }
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      });
    } else {
      return res
        .status(400)
        .send({ message: "User dosent exist, Please signup and continue" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const loggedinUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
 
    if (!token) return res.status(401).json({ message: "user Unauthorized" });

    const data = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(data.id);
    if (user) {
      return res.json({ user, message: "user found" });
    } else {
      return res.status(404).json({ message: "user not found" });
    }
  } catch (error) {
    res.json({
      message: "session has expire please login again",
    });
  }
};

module.exports = { getUser, signup, accActivation, login, loggedinUser };
