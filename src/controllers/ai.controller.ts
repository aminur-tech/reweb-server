import { Request, Response } from 'express';
import OpenAI from 'openai';
import config from '../config'; //
import { IChatMessage } from '../types/ai.interface';

const openai = new OpenAI({ apiKey: config.openai_api_key as string });

export const consultService = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    // IMPORTANT: Map 'bot' to 'assistant' so OpenAI understands the history
    const formattedHistory: OpenAI.Chat.ChatCompletionMessageParam[] = Array.isArray(history) 
      ? history.map((msg: IChatMessage) => ({
          role: (msg.role === 'bot' ? 'assistant' : 'user') as 'assistant' | 'user',
          content: msg.content
        }))
      : [];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are the ReWeb AI Architect. Guide users toward Web Development and SEO services." 
        },
        ...formattedHistory,
        { role: "user", content: message }
      ]
    });

    res.status(200).json({ 
      success: true, 
      reply: response.choices[0].message.content 
    });
  } catch (error: any) {
    console.error("AI Error:", error.message);
    res.status(500).json({ success: false, message: "AI internal error" });
  }
};

export const aiControllers = { consultService };