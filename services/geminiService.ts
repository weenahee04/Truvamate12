import { GoogleGenAI, Type } from "@google/genai";

// Lazy initialization - only create client when API key is available
let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI | null => {
  if (ai) return ai;
  
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
    return ai;
  }
  return null;
};

export const generateLuckyNumbers = async (context: string): Promise<{ main: number[], power: number, reason: string }> => {
  try {
    const client = getAI();
    
    // If no API key, use fallback immediately
    if (!client) {
      console.warn("No Gemini API key configured, using random numbers");
      return generateRandomNumbers();
    }
    
    const modelId = 'gemini-2.5-flash';
    
    const prompt = `
      Create a set of lucky lottery numbers for Powerball (5 numbers 1-69, 1 number 1-26) based on this user context/dream: "${context}".
      Provide a brief, mystical or fun reason in Thai language why these numbers were chosen.
    `;

    const response = await client.models.generateContent({
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
    return generateRandomNumbers();
  }
};

// Helper function for random number generation
const generateRandomNumbers = (): { main: number[], power: number, reason: string } => {
  const mainSet = new Set<number>();
  while (mainSet.size < 5) {
    mainSet.add(Math.floor(Math.random() * 69) + 1);
  }
  return {
    main: Array.from(mainSet).sort((a, b) => a - b),
    power: Math.floor(Math.random() * 26) + 1,
    reason: "🎲 เลขนำโชคจากระบบสุ่มอัตโนมัติ ขอให้โชคดี!"
  };
};
