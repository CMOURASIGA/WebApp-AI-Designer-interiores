
import { GoogleGenAI, Type } from "@google/genai";
import { Message, Suggestion, ProjectParams } from '../types';

// Função para garantir nova instância com a chave mais atual
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

const handleAiError = async (error: any) => {
  const errorMessage = error?.message || "";
  console.error("AI Service Error Detail:", error);

  // Erro 429: Quota atingida ou Billing necessário
  if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
    const isImageTask = errorMessage.includes("image");
    
    if (isImageTask) {
      alert("ERRO DE COTA (429): A geração de imagens exige uma API Key de um projeto com faturamento (billing) ativado no Google Cloud. Chaves do plano gratuito costumam ter cota zero para imagens.");
    } else {
      alert("Limite de cota de texto atingido. Aguarde alguns segundos e tente novamente.");
    }
    
    // Se estiver no AI Studio, abre o seletor para trocar por uma chave paga
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
    }
  } 
  // Erro de entidade não encontrada (chave inválida ou expirada)
  else if (errorMessage.includes("Requested entity was not found")) {
    if (window.aistudio) {
      alert("Chave de API não encontrada ou expirada. Selecione uma nova chave.");
      await window.aistudio.openSelectKey();
    } else {
      alert("Chave de API inválida. Configure a variável de ambiente API_KEY corretamente.");
    }
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
          systemInstruction: `Você é um Consultor de Design de Interiores. Projeto: ${context.params.roomType}, estilo: ${context.style}, orçamento: ${context.params.budget}. Responda em Português de forma profissional e curta.`,
        },
      });

      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.text || "Sem resposta.",
        timestamp: Date.now(),
      };
    } catch (error) {
      return await handleAiError(error);
    }
  }
};

export const designService = {
  generateSuggestions: async (style: string, params: ProjectParams): Promise<Suggestion[]> => {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Gere 3 sugestões técnicas em JSON para decorar um(a) ${params.roomType} no estilo ${style}.`,
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
      console.error("Erro em Sugestões:", e);
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
          parts: [{ text: `Professional interior design photo of an empty, minimalist ${roomType}, wide angle, 8k, architectural magazine style.` }]
        },
        config: {
          imageConfig: { aspectRatio: "16:9" }
        }
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
      throw new Error("Falha ao receber imagem da IA.");
    } catch (error) {
      return await handleAiError(error);
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
            { text: `Redesign this room exactly as it is but in ${style} style. Use a ${params.colors.join(' and ')} color palette. Photorealistic, 8k resolution, professional lighting.` }
          ]
        },
        config: {
          imageConfig: { aspectRatio: "16:9" }
        }
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
      throw new Error("Não foi possível processar a imagem.");
    } catch (error) {
      return await handleAiError(error);
    }
  }
};
