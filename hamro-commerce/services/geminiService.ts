import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from "../types";

// Initialize Gemini Client
// Note: In a real production app, this should be proxied through a backend to hide the API key.
// For this frontend-only demo, we use the environment variable directly.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are "Hamro Assistant", a helpful, friendly, and knowledgeable AI shopping assistant for "Hamro Commerce", a premier eCommerce store in Nepal.
Your goal is to help customers find products, answer questions about shipping (we offer fast delivery across Nepal), and provide trusted advice.
Tone: Professional, warm, and trustworthy.
Currency: NPR (Nepalese Rupee).
If asked to write marketing copy or social media posts, make them catchy and suitable for a Nepali audience.
`;

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });
};

export const sendMessageToGemini = async (chat: Chat, message: string): Promise<string> => {
  try {
    if (!apiKey) return "Please configure your API_KEY to use the AI assistant.";
    
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
};

export const generateProductDescription = async (productName: string, features: string): Promise<string> => {
  try {
    if (!apiKey) return "API Key missing.";

    const prompt = `Write a compelling, SEO-friendly product description for "${productName}". 
    Features: ${features}. 
    Focus on benefits and why a customer in Nepal would love this. Keep it under 150 words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Description unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not generate description.";
  }
};

export const generateSocialMediaAd = async (productName: string): Promise<string> => {
   try {
    if (!apiKey) return "API Key missing.";

    const prompt = `Write a catchy Facebook/Instagram ad caption for "${productName}" sold on Hamro Commerce. 
    Include emojis, hashtags like #HamroCommerce #NepalShopping, and a clear Call to Action.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Ad copy unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not generate ad copy.";
  }
}
