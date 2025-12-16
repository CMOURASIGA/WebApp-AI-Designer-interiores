import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is missing' });
  }

  const fallback = [
    {
      id: '1',
      title: 'Seleção de Mobiliário',
      description: 'Peças-chave para definir o estilo e manter o fluxo do ambiente.',
      items: ['Sofá neutro', 'Tapete texturizado', 'Mesa lateral leve'],
      tags: ['Mobiliário', 'Layout'],
    },
    {
      id: '2',
      title: 'Iluminação e Clima',
      description: 'Camadas de luz para conforto e funcionalidade.',
      items: ['Luminária de piso', 'Pendentes quentes 2700K', 'Dimmers'],
      tags: ['Iluminação', 'Ambiente'],
    },
    {
      id: '3',
      title: 'Materiais e Texturas',
      description: 'Combinação de texturas para enriquecer o espaço.',
      items: ['Madeira natural', 'Metal preto fosco', 'Tecidos de linho'],
      tags: ['Materiais', 'Texturas'],
    },
  ];

  try {
    const { style, params } = req.body || {};
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
Gere 3 sugestões de design curtas em formato JSON para um ambiente.
Campos: id (string), title, description, items (array de 3 itens curtos), tags (array de 2 tags curtas).
Fale em português do Brasil.
Contexto: estilo=${style}; ambiente=${params?.roomType}; área=${params?.area}m2; orçamento=${params?.budget}; cores=${(params?.colors || []).join(', ')}; ousadia=${params?.boldness}.
Responda APENAS com JSON válido (array).
    `.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      parsed = [];
    }

    const suggestions = (Array.isArray(parsed) ? parsed : fallback).slice(0, 3).map((s, idx) => ({
      id: s.id ?? String(idx + 1),
      title: s.title ?? 'Sugestão',
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
