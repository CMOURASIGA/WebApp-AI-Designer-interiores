
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
          systemInstruction: `Você é um Arquiteto Consultor Sênior. Sua comunicação deve ser estritamente técnica, organizada e visualmente hierarquizada.
          
          REGRAS DE FORMATAÇÃO (OBRIGATÓRIO):
          1. Use Títulos (### NOME DA SEÇÃO) para cada categoria.
          2. Use Listas com marcadores para itens específicos.
          3. Use **Negrito** apenas para materiais, cores ou marcas.
          4. NÃO use textos introdutórios longos ou despedidas poéticas.
          5. Vá direto ao ponto. Seja sucinto (Max 200 palavras).
          
          ESTRUTURA DA RESPOSTA:
          ### CONCEITO GERAL
          (Uma frase técnica resumindo a intenção do design)
          
          ### MOBILIÁRIO E LAYOUT
          * Item (Material/Acabamento)
          * Item (Layout/Posicionamento)
          
          ### PALETA E MATERIAIS
          * Paredes: (Cor/Textura)
          * Piso: (Material)
          * Têxteis: (Tecido/Trama)
          
          ### ILUMINAÇÃO TÉCNICA
          * Tipo de Peça (Temperatura de Cor/Função)
          
          Ambiente: ${context.params.roomType}. Estilo: ${context.style}.`,
        },
      });

      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.text || "Processando dados técnicos...",
        timestamp: Date.now(),
      };
    } catch (error) {
      const errorType = await handleAiError(error);
      return {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: errorType === "QUOTA_ERROR" 
          ? "Cota de API excedida. Aguarde 60s." 
          : "Erro técnico na resposta.",
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
          parts: [{ text: `Empty architectural space of a ${roomType}, flat perspective, natural lighting, high resolution.` }]
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
            { text: `Redesign this exact space: Style ${style}, Budget ${params.budget}, Palette ${params.colors.join(', ')}. Professional architectural photography.` }
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
