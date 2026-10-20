const mongoose = require("mongoose");

let isConnected = false; // prevent multiple connections

exports.connectMongo = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MongoDB connection string (MONGO_URI) is missing");
    }

    // ✅ If already connected, reuse it
    if (isConnected) {
      return mongoose.connection;
    }

    mongoose.set("bufferCommands", false);

    const options = {
      maxPoolSize: 10, // good balance
      serverSelectionTimeoutMS: 20000, // fail fast
      socketTimeoutMS: 45000,
      connectTimeoutMS: 20000,
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
      });
    }

    // ✅ Connect
    await mongoose.connect(process.env.MONGO_URI, options);

    isConnected = true;
    return mongoose.connection;
  } catch (err) {
    console.error("🚨 MongoDB connection failed:", {
      message: err.message,
      code: err.code,
      name: err.name,
    });
    throw err;
  }
};
