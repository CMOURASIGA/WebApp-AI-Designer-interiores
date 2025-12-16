<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Consultor de Design de Interiores IA

Prototipo em React + Vite para experimentar um fluxo de consultoria de interiores assistido por IA. A aplicacao permite enviar ou selecionar uma foto, escolher estilos, ajustar parametros (orcamento, cores, ousadia) e receber sugestoes mockadas e um visual "antes/depois" gerado com imagens de exemplo.

## Requisitos
- Node.js 18+ e npm

## Variaveis de ambiente
- `GEMINI_API_KEY` �?" chave do Gemini. Coloque em `.env.local` (local) e nas variǭveis da Vercel.
- `IMAGE_BUCKET_NAME` e `IMAGE_BUCKET_BASE_URL` �?" bucket pǭblico usado para servir as imagens geradas (ex.: `https://storage.googleapis.com/seu-bucket`).

## Rodar localmente
1) Instale dependencias: `npm install`
2) Copie/ajuste `.env.local` se quiser definir `GEMINI_API_KEY`
3) Suba o servidor de dev: `npm run dev` e abra o URL exibido (padrao http://localhost:5173)

## Build/preview
- Build de producao: `npm run build`
- Preview local do build: `npm run preview`

## Deploy na Vercel
A Vercel detecta Vite automaticamente:
- Framework: Vite
- Comando de build: `npm run build`
- Diretorio de saida: `dist`
- (Opcional) Adicione `GEMINI_API_KEY` nos Environment Variables se for integrar com a API real.

## Notas de projeto
- Chat e sugest��es agora chamam Gemini via rotas `/api/chat` e `/api/suggestions`.
- A rota `/api/image` agora usa Imagen (Gemini) para gerar imagem real e envia o arquivo para um bucket pǭblico.
- Tailwind e carregado via CDN no `index.html`, sem pipeline adicional.
