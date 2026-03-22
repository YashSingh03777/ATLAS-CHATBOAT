import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";


dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const getOpenAPIResponse = async (message) => {
  try {

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: message
    });

    const cleanText = result.text.trim();

    return cleanText;

  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to fetch response from Gemini API");
  }
};

export default getOpenAPIResponse;
