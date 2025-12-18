
import { GoogleGenAI, Type } from "@google/genai";
import { Message, Suggestion, ProjectParams } from '../types';

// Função para garantir nova instância com a chave mais atual
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("ERRO: API_KEY não encontrada nas variáveis de ambiente.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

// Auxiliar para converter URL de blob/imagem para base64
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
          systemInstruction: `Você é um Consultor de Design de Interiores experiente e criativo. 
          O projeto atual é uma ${context.params.roomType} no estilo ${context.style}. 
          O orçamento é ${context.params.budget} e o nível de ousadia é ${context.params.boldness}.
          Paleta de cores desejada: ${context.params.colors.join(', ')}.
          Responda sempre em Português do Brasil de forma profissional, inspiradora e técnica.`,
        },
      });

      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.text || "Desculpe, não consegui processar sua mensagem.",
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Chat Error:", error);
      throw error;
    }
  }
};

export const designService = {
  generateSuggestions: async (style: string, params: ProjectParams): Promise<Suggestion[]> => {
    try {
      const ai = getAI();
      const prompt = `Gere 3 sugestões detalhadas de design de interiores para uma ${params.roomType} no estilo ${style}. 
      Considere um orçamento ${params.budget} e área de ${params.area}m2. 
    Retorne um JSON com: title, description, items (lista de strings) e tags (lista de strings curtas).`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
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
      console.error("Erro ao gerar sugestões:", e);
      return [];
    }
  }
};

export const imageService = {
  generateInitialRoom: async (roomType: string): Promise<string> => {
    try {
      const ai = getAI();
      const prompt = `FOTOGRAFIA PROFISSIONAL: Um ambiente de ${roomType} vazio ou com mobília minimalista, iluminação natural suave entrando pelas janelas, arquitetura moderna com paredes brancas ou neutras, piso de madeira ou concreto. Alta definição, 8k, estilo 'página em branco' pronta para design de interiores.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: { aspectRatio: "16:9" }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      throw new Error("Nenhuma imagem gerada.");
    } catch (error) {
      console.error("Erro ao gerar sala inicial:", error);
      throw error;
    }
  },

  generateProposedImage: async (originalUrl: string, style: string, params: ProjectParams): Promise<string> => {
    try {
      const ai = getAI();
      const { data, mimeType } = await urlToBase64(originalUrl);
      
      const prompt = `TRANSFORMAÇÃO DE INTERIORES: Redesenhe este ambiente exatamente no estilo ${style}. 
      Mantenha a geometria estrutural do espaço, mas substitua toda a mobília, cores e iluminação. 
      Use a paleta: ${params.colors.join(', ')}. Nível de detalhamento: ${params.boldness}. 
      Resultado fotorrealista de alta qualidade, iluminação cinematográfica, renderização profissional.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data, mimeType } },
            { text: prompt }
          ]
        },
        config: {
          imageConfig: { aspectRatio: "16:9" }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      throw new Error("Falha ao gerar proposta de imagem.");
    } catch (error) {
      console.error("Erro na transformação de imagem:", error);
      throw error;
    }
  }
};
