const express = require('express');
const bcrypt = require('bcrypt');
const connectWithMongoose = require('../database/mongoose');
const jwt = require('jsonwebtoken');
const User = require('../modules/User');
const Task = require('../modules/Task');
const dbo = require('../database/db');
const { route } = require('./taskRoutes');
const ObjectId = require('mongodb').ObjectId;
const mongoose = require('mongoose');


const router = express.Router();

connectWithMongoose();

const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (!token) {
      console.log('No token provided.');
      return res.status(403).send({ message: 'No token provided.' });
  }

  jwt.verify(token, 'your-secret-key', (err, decoded) => {

      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).send({ message: 'Token expired.' });
        }
        console.log('Failed to authenticate token.');
          
        return res.status(500).send({ message: 'Failed to authenticate token.' });
      }
      req.user = { id: decoded.id };
      console.log("Verified");
      next();
  });
};


// Route to verify token
router.get('/verify-token', verifyToken, (req, res) => {
    res.send({ valid: true });
});

router.post('/edit-profile', verifyToken, async (req, res) => {


  const session = await mongoose.startSession();
  session.startTransaction();

  const { newUsername, newEmail, newPassword } = req.body;
  const dbConnect = dbo.getDb();
  const userId = req.user.id;
  console.log("newUsername", newUsername);
  console.log("userId ", userId);

  try {
    const existingUser = await User.findOne( { _id: new ObjectId(userId) } );

    if (!existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).send("Invalid user!");
    }

    const updateField = {};
    if (newUsername) {
      const existingUsername = await User.findOne( { username: newUsername } );
      if (existingUsername && existingUsername._id.toString() !== userId) {
        await session.abortTransaction();
        session.endSession();  
        return res.status(500).send("Username already existed!");
      }
      updateField.username = newUsername;
    }

    if (newEmail) {
      const existingEmail = await User.findOne({ email: newEmail });
      if (existingEmail && existingEmail._id.toString() !== userId) {
        await session.abortTransaction();
        session.endSession();  
        return res.status(500).send("Email already existed!");
      }
      updateField.email = newEmail;
    }

    if (newPassword) {
      updateField.password = newPassword;
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateField },
      { returnOriginal: false }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(updatedUser.value);

  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).send("Error updating user");
  }
});
router.get('/profile', verifyToken, async (req, res) => {
  const dbConnect = dbo.getDb();
  try {
    const userId = req.user.id;
    console.log(userId);
    const user = await User.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return res.status(404).send('User not found.');
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching the profile.');
  }
});

router.get('/search/:searchTerm', async (req, res) => {
    try {
        const { searchTerm } = req.params;
        console.log(searchTerm);
  
        // Perform a case-insensitive search for users whose username or email contains the search term
        const users = await User.find({
            $or: [
            { username: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } }
            ]
        });
    
        res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/delete-account', verifyToken, async (req, res) => {
  const { password } = req.body;
  console.log("pass: ", password);

  try {
    const userId = req.user.id;
    console.log(userId);
    const user = await User.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return res.status(404).send('User not found.');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect password.' });
    }

    await User.findOneAndDelete({ _id: userId });
    
    res.json({ success: true, message: 'Account deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete account.' });
  }
});

  
module.exports = router;
    