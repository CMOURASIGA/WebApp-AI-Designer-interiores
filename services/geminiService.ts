
import { GoogleGenAI, Type } from "@google/genai";
import { Message, Suggestion, ProjectParams } from '../types';

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

async function urlToBase64(url: string): Promise<{ data: string; mimeType: string }> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve({ data: base64, mimeType: blob.type });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Erro ao converter imagem para base64:", error);
    throw error;
  }
}

const handleAiError = async (error: any, silent: boolean = false) => {
  const errorMessage = error?.message || "";
  if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
    return "QUOTA_ERROR";
  } 
  if (errorMessage.includes("Requested entity was not found")) {
    if (window.aistudio && !silent) await window.aistudio.openSelectKey();
    return "KEY_ERROR";
  }
  throw error;
};

export const chatService = {
  sendMessage: async (history: Message[], userMessage: string, context: { style: string; params: ProjectParams }): Promise<Message> => {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...history.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: `Você é um Arquiteto e Consultor de Interiores Premium. 
          Ambiente: ${context.params.roomType}. Estilo: ${context.style}. 
          Cores: ${context.params.colors.join(', ')}. Ousadia: ${context.params.boldness}.
          
          IMPORTANTE: Se a geração de imagem falhar, sua missão é ser EXTREMAMENTE descritivo. 
          Fale sobre tecidos (linho, veludo), materiais (carvalho, metal escovado), iluminação (indireta, focada) e layout. 
          O usuário deve conseguir visualizar o projeto apenas lendo sua descrição. 
          Responda sempre em Português do Brasil com tom profissional e inspirador.`,
        },
      });

      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.text || "Estou preparando sua consultoria...",
        timestamp: Date.now(),
      };
    } catch (error) {
      const errorType = await handleAiError(error);
      return {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: errorType === "QUOTA_ERROR" 
          ? "Atingimos o limite de mensagens da API gratuita. Aguarde um minuto e tente novamente." 
          : "Tive um problema técnico. Pode repetir?",
        timestamp: Date.now()
      };
    }
  }
};

export const designService = {
  generateSuggestions: async (style: string, params: ProjectParams): Promise<Suggestion[]> => {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Gere 3 sugestões técnicas em JSON para decorar um(a) ${params.roomType} no estilo ${style}. Orçamento: ${params.budget}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                items: { type: Type.ARRAY, items: { type: Type.STRING } },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["title", "description", "items", "tags"],
            },
          },
        },
      });
      return JSON.parse(response.text || '[]');
    } catch (e) {
      return [];
    }
  }
};

export const imageService = {
  generateInitialRoom: async (roomType: string): Promise<string> => {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `High quality professional interior photo of a ${roomType}, empty, minimalist, high ceiling, 8k.` }]
        }
      });
      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
      throw new Error("No image");
    } catch (error) {
      const errorType = await handleAiError(error, true);
      if (errorType === "QUOTA_ERROR") return "IMAGE_QUOTA_EXHAUSTED";
      throw error;
    }
  },

  generateProposedImage: async (originalUrl: string, style: string, params: ProjectParams): Promise<string> => {
    try {
      const ai = getAI();
      const { data, mimeType } = await urlToBase64(originalUrl);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data, mimeType } },
            { text: `Redesign this exact room in ${style} style. Use a ${params.budget} budget approach. Colors: ${params.colors.join(', ')}. Professional architectural result.` }
          ]
        }
      });
      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
      throw new Error("No image");
    } catch (error) {
      const errorType = await handleAiError(error, true);
      if (errorType === "QUOTA_ERROR") return "IMAGE_QUOTA_EXHAUSTED";
      throw error;
    }
  }
};
