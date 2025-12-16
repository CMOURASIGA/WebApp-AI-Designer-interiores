import { GoogleGenerativeAI } from '@google/generative-ai';
import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const FALLBACK_URL = 'https://placehold.co/800x600?text=Proposta+IA';

const buildPrompt = (style, originalUrl) => `
VocǦ Ǹ um assistente de visualiza��ǜo de interiores. Gere um prompt conciso (1 frase) para gerar uma nova versǭo do ambiente no estilo ${style}.
Foque em materiais, ilumina��ǜo, paleta e mobiliǭrio mantendo a disposi��ǜo original (${originalUrl || 'sem URL fornecida'}).
Responda apenas com o prompt de imagem.`;

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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is missing' });
  }

  try {
    const { originalUrl, style } = req.body || {};
    const genAI = new GoogleGenerativeAI(apiKey);

    // 1) Gera um prompt enxuto para o modelo de imagem
    const textModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const promptResult = await textModel.generateContent(buildPrompt(style, originalUrl));
    const promptText = promptResult.response.text().trim();

    // 2) Gera a imagem com modelo de imagem (Gemini image)
    const imageModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp-image-generation' });
    const imageResult = await imageModel.generateContent(promptText);

    const imagePart = imageResult.response.candidates?.[0]?.content?.parts?.find(part => part.inlineData?.data);
    if (!imagePart?.inlineData?.data) {
      throw new Error('No image data returned from Imagen');
    }

    const mimeType = imagePart.inlineData.mimeType || 'image/png';
    const imageBase64 = imagePart.inlineData.data;

    // 3) Salva no bucket para servir via URL pǭblica
    const bucketUrl = await uploadToBucket(imageBase64, mimeType);
    const imageUrl = bucketUrl ?? `data:${mimeType};base64,${imageBase64}`;

    return res.status(200).json({ imageUrl, prompt: promptText, originalUrl });
  } catch (error) {
    console.error('Image API error', error);
    const errorDetail = error?.errorDetails || error?.message || 'Failed to generate image';
    return res.status(200).json({ imageUrl: FALLBACK_URL, prompt: null, error: 'Failed to generate image (fallback)', errorDetail });
  }
}
