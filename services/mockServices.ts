import { Message, Suggestion, ProjectParams } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const chatService = {
  sendMessage: async (history: Message[], userMessage: string, context: { style: string; params: ProjectParams }): Promise<Message> => {
    await delay(1500); // Simulate thinking

    let responseContent = `Analisei seu pedido para ${context.params.roomType} no estilo ${context.style}. `;

    const msgLower = userMessage.toLowerCase();

    if (msgLower.includes('sugestão') || msgLower.includes('ideia') || msgLower.includes('dica')) {
      responseContent += `Considerando seu orçamento ${context.params.budget.toLowerCase()}, recomendo focar em peças-chave de mobiliário que definam a estética sem sobrecarregar o espaço de ${context.params.area}m². O que acha?`;
    } else if (msgLower.includes('cor') || msgLower.includes('paleta')) {
      responseContent += `Para o estilo ${context.style}, geralmente tendemos para tons de ${context.params.colors.join(', ')}. Posso gerar uma nova paleta se quiser mais contraste.`;
    } else if (msgLower.includes('iluminação') || msgLower.includes('luz')) {
      responseContent += `A iluminação é crucial no estilo ${context.style}. Tente usar luzes indiretas ou quentes (2700K) para criar acolhimento.`;
    } else {
      responseContent += "Posso ajudar a refinar os materiais, a iluminação ou a disposição dos móveis. O que gostaria de focar agora?";
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: responseContent,
      timestamp: Date.now(),
    };
  }
};

export const designService = {
  generateSuggestions: async (style: string, params: ProjectParams): Promise<Suggestion[]> => {
    await delay(2000); // Simulate processing

    return [
      {
        id: '1',
        title: 'Seleção de Mobiliário Chave',
        description: `Peças curadas para combinar com a estética ${style} enquanto maximizam o fluxo na área de ${params.area}m².`,
        items: ['Poltrona de Acento', 'Tapete Geométrico', 'Luminária de Piso'],
        tags: ['Mobiliário', 'Layout']
      },
      {
        id: '2',
        title: 'Iluminação e Ambiente',
        description: 'Abordagem de iluminação em camadas para melhorar o humor e a funcionalidade.',
        items: ['Luminária Pendente', 'Lâmpadas Quentes (2700K)', 'Dimmers'],
        tags: ['Iluminação', 'Mood']
      },
      {
        id: '3',
        title: 'Paleta de Materiais',
        description: `Texturas que trazem o caráter ${params.boldness.toLowerCase()} à vida.`,
        items: ['Carvalho Natural', 'Metal Preto Fosco', 'Tecidos de Linho'],
        tags: ['Materiais', 'Texturas']
      }
    ];
  }
};

export const imageService = {
  generateProposedImage: async (originalUrl: string, style: string): Promise<string> => {
    await delay(2500); // Simulate image generation
    // Return a random architecture/interior image to simulate a result
    // We use a seed to get a consistent random image for the "after" effect
    const seed = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/seed/${seed}/800/600`;
  }
};