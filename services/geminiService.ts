
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Menggunakan process.env.API_KEY sesuai panduan
const API_KEY = "AIzaSyBmysuFYN0e-clwBEx2SnsUtpzxvcfBJEc";

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set in environment variable process.env.API_KEY. Application features relying on Gemini API will not work.");
  // If API_KEY is not set, new GoogleGenAI will likely fail. This is expected if the environment assumption is not met.
}

// Inisialisasi GoogleGenAI.
// API_KEY must be a string. The '!' asserts that API_KEY is non-null,
// based on the assumption that process.env.API_KEY is pre-configured and valid.
const ai = new GoogleGenAI({ apiKey: API_KEY! }); 
const modelName = 'gemini-2.5-flash-preview-04-17';

export interface GeminiResponse {
  text?: string;
  error?: string;
}

function formatAIResponse(text: string): string {
  let formattedText = text;
  // Bold: **text** to <strong>text</strong>
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Headlines: ### text to <h3>text</h3>
  formattedText = formattedText.replace(/^### (.*?)(?:\n|<br>|$)/gm, '<h3>$1</h3>');
  // Unordered list items: * item to <li>item</li>
  formattedText = formattedText.replace(/^\* (.*?)(?:\n|<br>|$)/gm, '<li>$1</li>');
  // Wrap consecutive <li> items in <ul>.
  formattedText = formattedText.replace(/(?:<li>.*?<\/li>\s*)+/gs, (match) => `<ul>${match.trim()}</ul>`);
  // Newlines to <br>
  formattedText = formattedText.replace(/\n(?!\s*<(?:ul|\/ul|h3|\/h3|li|\/li)>)/g, '<br>');
  // Cleanup <br> inside elements
  formattedText = formattedText.replace(/<h3>(.*?)<br\s*\/?>/g,'<h3>$1</h3>');
  formattedText = formattedText.replace(/<li>(.*?)<br\s*\/?>/g,'<li>$1</li>');
  // Remove <br> directly after </ul> or </h3>
  formattedText = formattedText.replace(/<\/(ul|h3)>\s*<br\s*\/?>/g, '</$1>');

  return formattedText;
}


export const callGeminiAPI = async (prompt: string, systemInstruction?: string): Promise<GeminiResponse> => {
  if (!API_KEY) { // Check if API_KEY was successfully retrieved from process.env
    return { error: "API Key for Gemini is not configured in process.env.API_KEY. Please ensure it is set in the execution environment." };
  }
  try {
    const config: { systemInstruction?: string, thinkingConfig?: {thinkingBudget: number} } = {};
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }
    // Untuk latensi lebih rendah, bisa nonaktifkan thinking jika model mendukung:
    // config.thinkingConfig = { thinkingBudget: 0 };


    const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelName, 
        contents: [{ role: "user", parts: [{ text: prompt }] }], 
        config: config,
    });
    
    const text = response.text; 
    if (text) {
      return { text: formatAIResponse(text) };
    } else {
      if (response.candidates && response.candidates[0]?.finishReason && response.candidates[0]?.finishReason !== 'STOP') {
         return { error: `AI response generation stopped due to: ${response.candidates[0]?.finishReason}. Check safety ratings or prompt content.`};
      }
      return { error: "AI did not return any text content. The response might be empty or blocked." };
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    let errorMessage = "Terjadi kesalahan saat menghubungi AI.";
    if (error.message) {
        errorMessage += ` Detail: ${error.message}`;
    }
    // Cek error spesifik dari Gemini API jika tersedia
    if (error.response && error.response.data && error.response.data.error) {
        errorMessage += ` Server Message: ${error.response.data.error.message}`;
    } else if (error.httpError) { 
        errorMessage += ` HTTP Status: ${error.httpError.status}`;
    }
    return { error: errorMessage };
  }
};
