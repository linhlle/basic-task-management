require("dotenv").config();
const mongoose = require('mongoose');

const connectWithMongoose = async () => {
  try {
    await mongoose.connect(process.env.ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Mongoose connection successful');
  } catch (error) {
    console.error('Mongoose connection error:', error.message);
  }
};

module.exports = connectWithMongoose;

