
import { GoogleGenAI, Type } from "@google/genai";
import { WorkflowPlan } from "@type";

// Always initialize with an object containing the apiKey.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Uses gemini-3-pro-preview for architecting complex workflows.
 */
export const generateWorkflow = async (userInput: string): Promise<WorkflowPlan> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Design a professional automation workflow for: "${userInput}". 
               The response must be detailed and follow the schema.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                type: { 
                  type: Type.STRING, 
                  description: "One of: trigger, action, condition" 
                },
              },
              required: ["id", "title", "description", "type"],
            },
          },
          outcome: { type: Type.STRING },
        },
        required: ["name", "steps", "outcome"],
      },
    },
  });

  try {
    // response.text is a property.
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Failed to parse workflow:", error);
    throw new Error("Could not architect workflow");
  }
};

/**
 * Simple support chat using gemini-3-flash-preview.
 */
export const getSupportChatResponse = async (userMessage: string, history: any[] = []) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'You are a professional support agent for Glacier Automations, a high-end SaaS platform for enterprise automations. You are helpful, minimalist, and precise. If asked about pricing, mention Base, Advanced, and Platform editions. Glacier uses AI to architect workflows from natural language.',
    },
    // SDK expects history in the configuration.
    history: history,
  });

  const response = await chat.sendMessage({ message: userMessage });
  // response.text is a property.
  return response.text;
};
