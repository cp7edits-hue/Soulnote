import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy initialization of Google GenAI SDK client
let aiClient = null;
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'SoulNote' });
});

/**
 * Gemini API endpoint for Mindful Perspective / [feature name]
 *
 * DATA MINIMIZATION:
 * In accordance with privacy-first architecture, we only send the minimum text
 * needed for [feature name] (the concise reflection prompt or emotion theme, max 120 chars)
 * rather than the full journal entry, private diary notes, or user reflection text.
 * Any full journal entry or personal note fields submitted in the request body are
 * strictly discarded before making the Gemini API call.
 */
export async function handlePerspectiveRequest(req, res) {
  let minimalText = 'Daily Mindful Reflection';
  try {
    const { prompt, topic, emotion, featureName } = req.body || {};

    // 1. DATA MINIMIZATION:
    // Extract ONLY the minimum text needed for [feature name] (e.g., prompt or topic string).
    // Intentionally omit and discard full journal entry content, private notes, and reflections.
    minimalText = (topic || prompt || emotion || 'Daily Mindful Reflection')
      .toString()
      .trim()
      .slice(0, 120);

    const client = getGeminiClient();
    if (!client) {
      return res.json({
        perspective: `Mindful perspective for "${minimalText}": Take a slow, quiet breath. Acknowledge what you feel without judgment, knowing every emotion shifts with time.`,
        isFallback: true,
        minimalTextSent: minimalText,
        notice: 'GEMINI_API_KEY is not set. A calm local perspective was provided.',
      });
    }

    // 2. ONLY send the minimum text prompt to Gemini
    const contents = `Provide a gentle, compassionate, 2-sentence mindful reflection for someone reflecting on the theme: "${minimalText}". Do not evaluate or criticize. Keep it grounding, warm, and brief.`;

    const apiCallPromise = client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction:
          'You are a calm, compassionate mindfulness companion. Offer brief, gentle perspectives in 1-2 sentences. Never diagnose or provide medical advice.',
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), 10000)
    );

    const response = await Promise.race([apiCallPromise, timeoutPromise]);

    const text = response.text || '';
    return res.json({
      perspective: text.trim(),
      minimalTextSent: minimalText,
    });
  } catch (error) {
    console.error('Error in Gemini API call for [feature name]:', error);
    return res.status(200).json({
      perspective: `Mindful pause for "${minimalText}": Take a gentle breath. You are doing the best you can in this moment. Allow yourself space to just be.`,
      minimalTextSent: minimalText,
      isFallback: true,
      notice: 'Gemini network request timed out or unconfigured. Returned local mindful perspective.',
    });
  }
}

// Support multiple endpoint aliases for [feature name]
app.post('/api/gemini/perspective', handlePerspectiveRequest);
app.post('/api/mindful-perspective', handlePerspectiveRequest);
app.post('/api/gemini/generate', handlePerspectiveRequest);

export async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Transform index.html with Vite for proper React Fast Refresh and plugins injection
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        if (fs.existsSync(indexPath)) {
          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } else {
          next();
        }
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SoulNote server running on http://localhost:${PORT}`);
  });
}

// Only listen if not imported into tests
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
