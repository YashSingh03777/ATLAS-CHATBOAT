import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import chatRoutes from "./routes/chat.js";

// Load .env only in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// ENV variables
const MONGODB_URI = process.env.MONGODB_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

// Validate ENV
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing!");
  process.exit(1);
}
if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing!");
  process.exit(1);
}

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ DB Connection Failed:", err.message);
    process.exit(1);
  }
};

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

// Health Route
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "🚀 Gemini API running",
  });
});

// Test Route (Gemini)
app.post("/test", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
    });

    return res.json({
      success: true,
      answer: response.text?.trim() || "No response",
    });
  } catch (err) {
    console.error("❌ Gemini Error:", err);

    return res.status(500).json({
      success: false,
      message: "AI request failed",
      error: err.message,
    });
  }
});

// Mount chat routes
app.use("/api", chatRoutes);

// Start Server (DB first, then server)
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
};

startServer();
