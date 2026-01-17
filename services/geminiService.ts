import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const scanMedicalReport = async (base64Image: string): Promise<ScanResult> => {
  const ai = getAI();
  // Using gemini-3-flash-preview as it is multimodal capable and fast
  const modelId = "gemini-3-flash-preview"; 
  
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image
            }
          },
          {
            text: "Analyze this pathology report image. Extract the Histology type, Depth of Myoinvasion, LVSI status, and any Molecular markers (POLE, MMR, p53). Return JSON."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            histology: { type: Type.STRING, description: "e.g., Endometrioid, Serous, Clear Cell" },
            myoinvasion: { type: Type.STRING, description: "e.g., None, <50%, >=50%" },
            lvsi: { type: Type.STRING, description: "e.g., None, Focal, Substantial" },
            poleMutation: { type: Type.BOOLEAN },
            mmrDeficient: { type: Type.BOOLEAN },
            p53Abnormal: { type: Type.BOOLEAN }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ScanResult;
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Gemini Scan Error:", error);
    throw error;
  }
};

export const explainRiskAssessment = async (stage: string, risk: string, treatment: string[]): Promise<string> => {
  const ai = getAI();
  const modelId = "gemini-3-pro-preview";
  const prompt = `
    You are a compassionate, world-class oncologist speaking to a patient.
    The patient has:
    - Stage: ${stage}
    - Risk Group: ${risk}
    - Recommended Treatment: ${treatment.join(", ")}

    Explain what this means in simple, reassuring, plain English. 
    Focus on the "Why" of the treatment.
    Keep it under 3 short sentences.
    Do not use medical jargon without explaining it.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "I apologize, I couldn't generate an explanation at this moment.";
  } catch (error) {
    console.error("Gemini Explainer Error:", error);
    return "Service temporarily unavailable. Please check API Key.";
  }
};

export const sendChatMessage = async (history: {role: string, text: string}[], currentContext: string): Promise<string> => {
  const ai = getAI();
  const modelId = "gemini-3-pro-preview";
  const lastMessage = history[history.length - 1];
  
  // Format history for SDK
  const previousHistory = history.slice(0, -1).map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  const chat = ai.chats.create({
    model: modelId,
    history: previousHistory,
    config: {
        systemInstruction: `You are OncoGuide, a helpful assistant for endometrial cancer. 
        Current Patient Context: ${currentContext}.
        Answer questions based on this context. Be concise, accurate, and empathetic. 
        Disclaimer: You are an AI, not a doctor.`
    }
  });

  try {
    const result = await chat.sendMessage({ message: lastMessage.text });
    return result.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting right now.";
  }
};