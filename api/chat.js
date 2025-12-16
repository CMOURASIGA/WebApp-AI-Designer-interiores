import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (provider === 'gemini' && !geminiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is missing' });
  }
  if (provider === 'openai' && !openaiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is missing' });
  }

  try {
    const { history = [], userMessage = '', context = {} } = req.body || {};

    const systemPrompt = `
Você é um consultor de design de interiores. Responda de forma breve e prática em português.
Considere estilo atual, tipo de ambiente, área, orçamento, cores e ousadia.
Mantenha respostas em tom colaborativo, sem listas longas a menos que o usuário peça.
    `.trim();

    let reply = '';

    if (provider === 'openai') {
      const client = new OpenAI({ apiKey: openaiKey });
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
          })),
          {
            role: 'user',
            content: `Contexto: estilo=${context.style}; ambiente=${context.params?.roomType}; área=${context.params?.area}m2; orçamento=${context.params?.budget}; cores=${(context.params?.colors || []).join(', ')}; ousadia=${context.params?.boldness}.
Pergunta: ${userMessage}`,
          },
        ],
      });
      reply = completion.choices[0]?.message?.content || '';
    } else {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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
      reply = result.response.text();
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat API error', error);
    return res.status(200).json({ reply: 'Não consegui gerar resposta agora. Tente novamente em instantes.', error: 'Failed to generate response' });
  }
}
