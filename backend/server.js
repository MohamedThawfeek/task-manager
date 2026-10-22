require("dotenv").config();
const app = require("./src/app");
const { connectMongo } = require("./src/config");

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await connectMongo();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    console.error("Please check:");
    console.error("1. MongoDB server is running and accessible");
    console.error("2. MONGO_URI environment variable is set correctly");
    console.error("3. Network connectivity to MongoDB server");
    console.error("4. Firewall rules allow connection to MongoDB port");
    process.exit(1);
  }
}

startServer();

module.exports = app;
