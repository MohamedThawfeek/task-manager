const mongoose = require("mongoose");

let isConnected = false;
let connectionPromise = null;

exports.connectMongo = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MongoDB connection string (MONGO_URI) is missing in environment variables");
    }

    // ✅ If already connected, reuse it
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      return mongoose.connection;
    }

    // ✅ If connection is currently in progress, wait for it
    if (connectionPromise) {
      return await connectionPromise;
    }

    mongoose.set("bufferCommands", false);

    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
    };

    // ✅ Register listeners ONCE
    if (!mongoose.connection.listenerCount("connected")) {
      mongoose.connection.on("connected", () => {
        console.log("✅ MongoDB connected", mongoose.connection.name);
      });

      mongoose.connection.on("error", (err) => {
        console.error("❌ MongoDB error:", err.message);
      });

      mongoose.connection.on("disconnected", () => {
        console.warn("⚠️ MongoDB disconnected");
        isConnected = false;
        connectionPromise = null;
      });
    }

    // ✅ Connect with promise caching
    connectionPromise = mongoose.connect(process.env.MONGO_URI, options);
    await connectionPromise;

    isConnected = true;
    connectionPromise = null;
    return mongoose.connection;
  } catch (err) {
    isConnected = false;
    connectionPromise = null;
    console.error("🚨 MongoDB connection failed:", {
      message: err.message,
      code: err.code,
      name: err.name,
    });
    throw err;
  }
};
