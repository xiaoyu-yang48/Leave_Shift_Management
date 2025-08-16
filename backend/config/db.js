// config/db.js
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Set strictQuery explicitly to suppress the warning
mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;
    
    // If we're in development and MongoDB is not available, use in-memory server
    if (process.env.NODE_ENV !== 'production' && process.env.USE_MEMORY_DB === 'true') {
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log("Using in-memory MongoDB for development");
    }
    
    await mongoose.connect(mongoUri);  // Remove deprecated options
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    
    // Try to use in-memory server as fallback
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log("Attempting to use in-memory MongoDB as fallback...");
        const mongod = await MongoMemoryServer.create();
        const mongoUri = mongod.getUri();
        await mongoose.connect(mongoUri);
        console.log("In-memory MongoDB connected successfully");
      } catch (fallbackError) {
        console.error("Failed to connect to in-memory MongoDB:", fallbackError.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
