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

  const fallback = [
    {
      id: '1',
      title: 'Sele��ǜo de Mobiliǭrio',
      description: 'Pe��as-chave para definir o estilo e manter o fluxo do ambiente.',
      items: ['Sofǭ neutro', 'Tapete texturizado', 'Mesa lateral leve'],
      tags: ['Mobiliǭrio', 'Layout'],
    },
    {
      id: '2',
      title: 'Ilumina��ǜo e Clima',
      description: 'Camadas de luz para conforto e funcionalidade.',
      items: ['Luminǭria de piso', 'Pendentes quentes 2700K', 'Dimmers'],
      tags: ['Ilumina��ǜo', 'Ambiente'],
    },
    {
      id: '3',
      title: 'Materiais e Texturas',
      description: 'Combina��ǜo de texturas para enriquecer o espa��o.',
      items: ['Madeira natural', 'Metal preto fosco', 'Tecidos de linho'],
      tags: ['Materiais', 'Texturas'],
    },
  ];

  try {
    const { style, params } = req.body || {};

    const prompt = `
Gere 3 sugest��es de design curtas em formato JSON para um ambiente.
Campos: id (string), title, description, items (array de 3 itens curtos), tags (array de 2 tags curtas).
Fale em portuguǦs do Brasil.
Contexto: estilo=${style}; ambiente=${params?.roomType}; ǭrea=${params?.area}m2; or��amento=${params?.budget}; cores=${(params?.colors || []).join(', ')}; ousadia=${params?.boldness}.
Responda APENAS com JSON vǭlido (array).
    `.trim();

    let text = '';
    if (provider === 'openai') {
      const client = new OpenAI({ apiKey: openaiKey });
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'Responda apenas com JSON vǭlido.' }, { role: 'user', content: prompt }],
        temperature: 0.7,
      });
      text = completion.choices[0]?.message?.content || '';
    } else {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      text = result.response.text();
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      parsed = [];
    }

    const suggestions = (Array.isArray(parsed) ? parsed : fallback).slice(0, 3).map((s, idx) => ({
      id: s.id ?? String(idx + 1),
      title: s.title ?? 'Sugestǜo',
      description: s.description ?? '',
      items: Array.isArray(s.items) ? s.items : [],
      tags: Array.isArray(s.tags) ? s.tags : [],
    }));

    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Suggestions API error', error);
    return res.status(200).json({ suggestions: fallback, error: 'Failed to generate suggestions' });
  }
}
