// config/db.js
const mongoose = require("mongoose");

let memoryServer = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri || mongoUri.includes('<YOUR')) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      await mongoose.connect(memUri);
      console.log("MongoDB (in-memory) connected successfully");
    } else {
      await mongoose.connect(mongoUri);
      console.log("MongoDB connected successfully");
    }
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
