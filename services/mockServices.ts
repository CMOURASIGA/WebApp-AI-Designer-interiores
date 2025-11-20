import { Message, Suggestion, ProjectParams } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const chatService = {
  sendMessage: async (history: Message[], userMessage: string, context: { style: string; params: ProjectParams }): Promise<Message> => {
    await delay(1500); // Simulate thinking

    let responseContent = `I've analyzed your request for a ${context.params.roomType} in ${context.style} style. `;

    if (userMessage.toLowerCase().includes('suggestion') || userMessage.toLowerCase().includes('idea')) {
      responseContent += `Considering your ${context.params.budget.toLowerCase()} budget, I recommend focusing on key furniture pieces that define the aesthetic without cluttering the ${context.params.area}m² space. How does that sound?`;
    } else if (userMessage.toLowerCase().includes('color')) {
      responseContent += `For ${context.style}, we usually lean towards ${context.params.colors.join(', ')} tones. I can generate a new palette if you'd like more contrast.`;
    } else {
      responseContent += "I can help you refine the materials, lighting, or furniture layout. What would you like to focus on next?";
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
        title: 'Key Furniture Selection',
        description: `Curated pieces to match the ${style} aesthetic while maximizing flow in a ${params.area}m² area.`,
        items: ['Velvet Accent Chair', 'Geometric Rug', 'Brass Floor Lamp'],
        tags: ['Furniture', 'Layout']
      },
      {
        id: '2',
        title: 'Lighting & Ambiance',
        description: 'Layered lighting approach to enhance mood and functionality.',
        items: ['Pendant Light', 'Warm White Bulbs (2700K)', 'Dimmer Switches'],
        tags: ['Lighting', 'Mood']
      },
      {
        id: '3',
        title: 'Material Palette',
        description: `Textures that bring the ${params.boldness} character to life.`,
        items: ['Natural Oak', 'Matte Black Metal', 'Linen Textiles'],
        tags: ['Materials', 'Textures']
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
