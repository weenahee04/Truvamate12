import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLuckyNumbers = async (context: string): Promise<{ main: number[], power: number, reason: string }> => {
  try {
    const modelId = 'gemini-2.5-flash';
    
    const prompt = `
      Create a set of lucky lottery numbers for Powerball (5 numbers 1-69, 1 number 1-26) based on this user context/dream: "${context}".
      Provide a brief, mystical or fun reason in Thai language why these numbers were chosen.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mainNumbers: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER },
              description: "5 unique numbers between 1 and 69"
            },
            powerNumber: {
              type: Type.INTEGER,
              description: "1 number between 1 and 26"
            },
            reason: {
              type: Type.STRING,
              description: "A short explanation in Thai language"
            }
          },
          required: ["mainNumbers", "powerNumber", "reason"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    // Fallback/Validation if model hallucinates range (rare but possible)
    const validMain = result.mainNumbers.map((n: number) => Math.max(1, Math.min(69, n))).slice(0, 5);
    const validPower = Math.max(1, Math.min(26, result.powerNumber));

    return {
      main: validMain,
      power: validPower,
      reason: result.reason
    };

  } catch (error) {
    console.error("Gemini AI Error:", error);
    // Fallback random numbers
    return {
      main: Array.from({ length: 5 }, () => Math.floor(Math.random() * 69) + 1),
      power: Math.floor(Math.random() * 26) + 1,
      reason: "AI กำลังพักผ่อน เราจึงสุ่มตัวเลขให้คุณแทน"
    };
  }
};
