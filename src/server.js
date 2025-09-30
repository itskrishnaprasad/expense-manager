import dotenv from "dotenv";
import mongoose from "mongoose"; // 1. Import mongoose
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// 2. Create a function to connect to DB and start the server
const startServer = async () => {
  try {
    // Connect to MongoDB using the URI from your .env file
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully");

    // Start the Express server only after the DB connection is successful
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1); // Exit the process with a failure code
  }
};

// 3. Call the function to start the server
startServer();
