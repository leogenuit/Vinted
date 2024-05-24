const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

// Import de mes modèles
const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    const userAlreadyExist = await User.findOne({ email: req.body.email });
    if (userAlreadyExist) {
      return res.status(400).json({ message: "Email already used" });
    }
    if (!req.body.username) {
      return res.status(400).json({ message: "username is mandatory " });
    }

    const token = uid2(64);
    const salt = uid2(64);
    // En cryptage password
    const hash = SHA256(req.body.password + salt).toString(encBase64);

    const user = new User({
      email: req.body.email,
      account: {
        username: req.body.username,
      },
      newsletter: req.body.newsletter,
      password: req.body.password,
      token: token,
      hash: hash,
      salt: salt,
    });
    await user.save();
    res.status(201).json({
      _id: user._id,
      token: user.token,
      account: user.account,
    });
  } catch (error) {
    console.log("error => ", error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ message: "email or password incorrect" });
    }
    const passwordHashed = SHA256(req.body.password + user.salt).toString(
      encBase64
    );

    if (passwordHashed === user.hash) {
      return res.status(200).json({
        _id: user._id,
        token: user.token,
        account: user.account,
      });
    } else {
      return res.status(400).json({ message: "email or password incorrect" });
    }
  } catch (error) {
    console.log("error => ", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
