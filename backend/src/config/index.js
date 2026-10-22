const mongoose = require("mongoose");

const mongoCache = globalThis.mongoCache || {
  connection: null,
  promise: null,
};

globalThis.mongoCache = mongoCache;

exports.connectMongo = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MongoDB connection string (MONGO_URI) is missing in environment variables");
    }

    if (mongoCache.connection && mongoose.connection.readyState === 1) {
      return mongoCache.connection;
    }

    if (mongoCache.connection && mongoose.connection.readyState === 0) {
      mongoCache.connection = null;
      mongoCache.promise = null;
    }

    if (!mongoCache.promise) {
      mongoose.set("bufferCommands", false);
      mongoCache.promise = mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 5000,
      });
    }

    mongoCache.connection = await mongoCache.promise;
    console.log("MongoDB connected", mongoose.connection.name);
    return mongoCache.connection;
  } catch (err) {
    mongoCache.connection = null;
    mongoCache.promise = null;
    console.error("MongoDB connection failed:", {
      message: err.message,
      code: err.code,
      name: err.name,
    });
    throw err;
  }
};
