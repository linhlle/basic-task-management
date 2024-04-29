const express = require('express');
const bcrypt = require('bcrypt');
const connectWithMongoose = require('../database/mongoose');
const jwt = require('jsonwebtoken');
const User = require('../modules/User');
const router = express.Router();
const dbo = require('../database/db');
const validator = require('validator');
const mongoose = require('mongoose');




// Middleware function to verify the JWT token in the request headers.
const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (!token) {
    return res.status(403).send({ message: 'No token provided.' });
  }

  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(500).send({ message: 'Failed to authenticate token.' });
    }
    req.user = { id: decoded.id };
    next();
  });
};

// Route to verify token
router.get('/verify-token', verifyToken, (req, res) => {
  res.send({ valid: true });
});

connectWithMongoose();

// Route to authenticate user and login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(username);
  console.log(password);

  try {
    const user = await User.findOne({ username });
    console.log(user);

    // Validate user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).send('Invalid login credentials');
    }

    const token = jwt.sign({ id: user._id }, 'your-secret-key', { expiresIn: '1h' });

    return res.status(200).json({ message: "Login successful", token: token });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred during the login process.');
  }
});

// Route to register a new user
connectWithMongoose();
router.post('/register', async (req, res) => {
  const { email, username, password } = req.body;

  if (!validator.isEmail(email) || !validator.isAlphanumeric(username)) {
    return res.status(400).json({ message: 'Invalid email or username format' });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
  
      return res.status(400).json({ message: 'User already exists with the given email or username' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
    });

    // await newUser.save();
    await newUser.save({ session });
    await session.commitTransaction();
    session.endSession();
 

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Server Error' });
  }
});


connectWithMongoose();

// Route to verify uniqueness of username and email
router.post('/verify-unique', verifyToken, async (req, res) => {
  const { newUsername, newEmail } = req.body;
  const existingUser = await User.findOne({ $or: [{ email: newEmail }, { username: newUsername }] });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists with the given email or username' });
  }
  res.status(200).json({ message: "Valid new username and email" });
});

// Route to verify user password
router.post('/verify-password', verifyToken, async (req, res) => {
  const { password } = req.body;

  const userId = req.user.id;

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(500).send('Invalid login token!');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).send('Invalid password!');
    }

    return res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
