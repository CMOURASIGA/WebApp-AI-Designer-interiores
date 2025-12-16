import { Message, Suggestion, ProjectParams } from '../types';

const apiFetch = async (url: string, body: any) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
};

export const chatService = {
  sendMessage: async (
    history: Message[],
    userMessage: string,
    context: { style: string; params: ProjectParams }
  ): Promise<Message> => {
    const data = await apiFetch('/api/chat', { history, userMessage, context });
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: data.reply ?? 'Não foi possível gerar resposta agora.',
      timestamp: Date.now(),
    };
  },
};

export const designService = {
  generateSuggestions: async (style: string, params: ProjectParams): Promise<Suggestion[]> => {
    const data = await apiFetch('/api/suggestions', { style, params });
    return data.suggestions ?? [];
  },
};

export const imageService = {
  generateProposedImage: async (originalUrl: string, style: string): Promise<string> => {
    const data = await apiFetch('/api/image', { originalUrl, style });
    return data.imageUrl ?? originalUrl;
  },
};
