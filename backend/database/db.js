require("dotenv").config({ path: "./config.env" });

const { MongoClient, ServerApiVersion } = require("mongodb");

const Db = process.env.ATLAS_URI;

const client = new MongoClient(Db, {
  serverApi: {
    version: ServerApiVersion.v1, 
    strict: true, 
    deprecationErrors: true, 
  }
});

var _db;

/**
 * Connects to the MongoDB server and initializes the _db variable with the database instance.
 * This function should be called at the start of the application.
 */
async function connectToServer() {
  try {
    await client.connect();
    _db = client.db("task_management"); 
    console.log("Successfully connected to MongoDB.");
  } catch (err) {
    // Log and handle any connection errors
    console.error("Failed to connect to MongoDB", err);
    throw err; 
  }
}

/**
 * Returns the database connection object.
 * Throws an error if the connection has not been established.
 * @returns {MongoClient} The database connection object
 */
function getDb() {
  if (!_db) {
    throw new Error("No database connection");
  }
  return _db;
}

// Export the connectToServer and getDb functions for use in other parts of the application
module.exports = { connectToServer, getDb };
