import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // support larger payloads for base64 images

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/chat', async (req, res) => {
  const { message, image } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    // Use GPT-4 with Vision if an image is provided
    if (image) {
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: message },
              { type: "image_url", image_url: { url: image } }
            ],
          },
        ],
        max_tokens: 1000,
      });

      res.json({ reply: response.choices[0].message.content });
    } else {
      // Fallback to GPT-3.5 for text-only
      const chatResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      });

      res.json({ reply: chatResponse.choices[0].message.content });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OpenAI API error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



