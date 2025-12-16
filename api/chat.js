import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is missing' });
  }

  try {
    const { history = [], userMessage = '', context = {} } = req.body || {};

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const systemPrompt = `
Você é um consultor de design de interiores. Responda de forma breve e prática em português.
Considere estilo atual, tipo de ambiente, área, orçamento, cores e ousadia.
Mantenha respostas em tom colaborativo, sem listas longas a menos que o usuário peça.
    `.trim();

    const messages = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      {
        role: 'user',
        parts: [
          {
            text: `Contexto: estilo=${context.style}; ambiente=${context.params?.roomType}; área=${context.params?.area}m2; orçamento=${context.params?.budget}; cores=${(context.params?.colors || []).join(', ')}; ousadia=${context.params?.boldness}.
Pergunta: ${userMessage}`,
          },
        ],
      },
    ];

    const result = await model.generateContent({ contents: messages });
    const reply = result.response.text();

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat API error', error);
    return res.status(200).json({ reply: 'Não consegui gerar resposta agora. Tente novamente em instantes.', error: 'Failed to generate response' });
  }
}
