
import { GoogleGenAI, Type } from "@google/genai";
import { Message, Suggestion, ProjectParams } from '../types';

// Função para garantir nova instância com a chave mais atual
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Auxiliar para converter URL de blob/imagem para base64
async function urlToBase64(url: string): Promise<{ data: string; mimeType: string }> {
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
}

export const chatService = {
  sendMessage: async (history: Message[], userMessage: string, context: { style: string; params: ProjectParams }): Promise<Message> => {
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
  }
};

export const designService = {
  generateSuggestions: async (style: string, params: ProjectParams): Promise<Suggestion[]> => {
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

    try {
      return JSON.parse(response.text);
    } catch (e) {
      console.error("Erro ao parsear sugestões", e);
      return [];
    }
  }
};

export const imageService = {
  // Gera um ambiente inicial do zero baseado em um prompt
  generateInitialRoom: async (roomType: string): Promise<string> => {
    const ai = getAI();
    const prompt = `Uma fotografia fotorrealista de alta qualidade de uma ${roomType} vazia ou com mobília básica, 
    iluminação natural, estilo moderno neutro, pronta para ser decorada. Ângulo amplo, arquitetura limpa.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    let imageUrl = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }
    return imageUrl;
  },

  generateProposedImage: async (originalUrl: string, style: string, params: ProjectParams): Promise<string> => {
    const ai = getAI();
    const { data, mimeType } = await urlToBase64(originalUrl);
    
    const prompt = `Redesenhe este ambiente seguindo estritamente o estilo ${style}. 
    Mantenha a estrutura arquitetônica (paredes, janelas, portas) mas altere todo o mobiliário, 
    decoração, iluminação e acabamentos. Use a paleta de cores: ${params.colors.join(', ')}. 
    O nível de decoração deve ser ${params.boldness}. 
    A imagem final deve ser fotorrealista, de alta qualidade e digna de uma revista de arquitetura.`;

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

    let imageUrl = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) throw new Error("Falha ao gerar imagem");
    return imageUrl;
  }
};
