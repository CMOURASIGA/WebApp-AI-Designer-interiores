import { GoogleGenerativeAI } from '@google/generative-ai';
import { Storage } from '@google-cloud/storage';
import OpenAI from 'openai';

const storage = new Storage();
const FALLBACK_URL = 'https://placehold.co/800x600?text=Proposta+IA';

const buildPrompt = (style, originalUrl) => `
Você é um assistente de visualização de interiores. Gere um prompt conciso (1 frase) para gerar uma nova versão do ambiente no estilo ${style}.
Foque em materiais, iluminação, paleta e mobiliário mantendo a disposição original (${originalUrl || 'sem URL fornecida'}).
Responda apenas com o prompt de imagem.`;

const directPrompt = (style, originalUrl) =>
  `Recrie a foto do ambiente (${originalUrl || 'imagem enviada'}) no estilo ${style}, preservando layout e proporções. Destaque materiais, paleta e iluminação coerentes com ${style}.`;

const getEnvBucket = () => {
  const bucketName = process.env.IMAGE_BUCKET_NAME || process.env.PUBLIC_IMAGE_BUCKET;
  const baseUrl = process.env.IMAGE_BUCKET_BASE_URL || (bucketName ? `https://storage.googleapis.com/${bucketName}` : null);
  return { bucketName, baseUrl };
};

const uploadToBucket = async (imageBase64, mimeType = 'image/png') => {
  const { bucketName, baseUrl } = getEnvBucket();
  if (!bucketName || !baseUrl) return null;

  const fileName = `ai-proposta-${Date.now()}-${Math.floor(Math.random() * 1e6)}.png`;
  const file = storage.bucket(bucketName).file(fileName);

  await file.save(Buffer.from(imageBase64, 'base64'), {
    resumable: false,
    public: true,
    metadata: { contentType: mimeType },
  });

  try {
    await file.makePublic();
  } catch (err) {
    console.warn('makePublic failed (bucket may already be public)', err?.message || err);
  }

  return `${baseUrl}/${fileName}`;
};

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
    const { originalUrl, style } = req.body || {};

    if (provider === 'openai') {
      const client = new OpenAI({ apiKey: openaiKey });
      const promptText = directPrompt(style, originalUrl);
      const imageResult = await client.images.generate({
        model: 'gpt-image-1',
        prompt: promptText,
        size: '1024x1024',
      });
      const imageUrl = imageResult.data?.[0]?.url;
      if (!imageUrl) throw new Error('No image URL returned from OpenAI');
      return res.status(200).json({ imageUrl, prompt: promptText, originalUrl });
    }

    const genAI = new GoogleGenerativeAI(geminiKey);

    const textModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const promptResult = await textModel.generateContent(buildPrompt(style, originalUrl));
    const promptText = promptResult.response.text().trim();

    const imageModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp-image-generation' });
    const imageResult = await imageModel.generateContent(promptText);

    const imagePart = imageResult.response.candidates?.[0]?.content?.parts?.find(part => part.inlineData?.data);
    if (!imagePart?.inlineData?.data) {
      throw new Error('No image data returned from Imagen');
    }

    const mimeType = imagePart.inlineData.mimeType || 'image/png';
    const imageBase64 = imagePart.inlineData.data;

    const bucketUrl = await uploadToBucket(imageBase64, mimeType);
    const imageUrl = bucketUrl ?? `data:${mimeType};base64,${imageBase64}`;

    return res.status(200).json({ imageUrl, prompt: promptText, originalUrl });
  } catch (error) {
    console.error('Image API error', error);
    const errorDetail = error?.errorDetails || error?.message || 'Failed to generate image';
    return res.status(200).json({ imageUrl: FALLBACK_URL, prompt: null, error: 'Failed to generate image (fallback)', errorDetail });
  }
}
