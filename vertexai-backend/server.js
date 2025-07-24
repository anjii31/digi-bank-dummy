// Vertex AI Gemini Chatbot Backend
// 1. Set GOOGLE_APPLICATION_CREDENTIALS env variable to your service account JSON file
// 2. Replace 'YOUR_PROJECT_ID' with your GCP project ID
// 3. Run: npm install express cors @google-cloud/vertexai
// 4. Start: node server.js

import express from 'express';
import cors from 'cors';
import { VertexAI } from '@google-cloud/vertexai';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());


// Set your Google Cloud project and region
const vertexAi = new VertexAI({ project: 'humming-bird-466715-f5', location: 'us-central1' });

app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    const model = vertexAi.preview.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userMessage }] }]
    });
    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, no response.';
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ text: 'Error communicating with Vertex AI.' });
  }
});

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Vertex AI Chatbot server running on port ${PORT}`)); 