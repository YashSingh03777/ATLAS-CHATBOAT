import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", chatRoutes);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Health route
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Gemini API running 🚀"
  });
});

const connectDB = async() => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");
  }  catch(err) {
     console.log( "Failed to connect with DB" , err);
  }
}

// AI route
app.post("/test", async (req, res) => {
  try {

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required"
      });
    }

    const result = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt
    });

    const cleanText = result.text.trim();

    res.json({
      success: true,
      prompt: prompt,
      answer: cleanText
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "AI request failed",
      error: error.message
    });

  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});