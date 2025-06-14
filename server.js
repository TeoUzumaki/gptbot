import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Health check route
app.get('/health', (req, res) => {
  res.status(200).send('GPT bot server is awake');
});

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  console.log("Received message:", message);

  if (!message) return res.status(400).json({ error: 'Message required' });

  const currentDateTime = new Date().toLocaleString('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  try {
    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: `The current date and time in London is ${currentDateTime}. User asked: ${message}` },
    ];

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
    });

    res.json({ reply: chatResponse.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OpenAI API error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));





