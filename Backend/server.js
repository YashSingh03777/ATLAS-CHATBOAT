// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js"; // make sure chat.js exists
import path from "path";

// Load environment variables from Render secret file if exists
const SECRET_FILE_PATH = "/etc/secrets/myenv"; // Replace 'myenv' with your secret file name
dotenv.config({ path: SECRET_FILE_PATH });

// Fallback: also load local .env for dev
dotenv.config();

// Extract env variables
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Check env variables
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing!");
  process.exit(1);
}
if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing!");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ Failed to connect with DB", err);
    process.exit(1); // stop server if DB fails
  }
};

// Initialize Google GenAI
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Health route
app.get("/", (req, res) => {
  res.json({ status: "success", message: "Gemini API running 🚀" });
});

// Test route
app.post("/test", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    const result = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt
    });

    const cleanText = result.text.trim();

    res.json({ success: true, prompt, answer: cleanText });
  } catch (err) {
    console.error("❌ /test error:", err.message);
    res.status(500).json({ success: false, message: "AI request failed", error: err.message });
  }
});

// Mount chat routes
app.use("/api", chatRoutes); // make sure chatRoutes exports a router

// Start server after DB connects
app.listen(PORT, async () => {
  await connectDB();
  console.log(`✅ Server running on port ${PORT}`);
});
