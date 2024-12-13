import Openai from "openai";
import dotenv from "dotenv";
import { chatRooms } from "../lib/rooms";
dotenv.config();

const openai = new Openai({ apiKey: process.env.OPENAI_API_KEY });

export async function generateAI(message: string, roomId: number): Promise<string> {
  const style = chatRooms.find((room) => room.id === roomId)?.name

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 200,
      messages: [
        {
          role: "system",
          content:
            `You are an expert in translation modern English text into ${style} style.`,
        },
        {
          role: "user",
          content: `Transform the following into ${style} style: ${message}.`,
        },
      ],
    });

    if (!completion.choices[0].message.content) {
      throw new Error("No response received");
    }

    return completion.choices[0].message.content;
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("429")) {
        console.error("Rate limit exceeded:", error.message);
        throw new Error(
          "You have exceeded the rate limit. Please try again later."
        );
      }

      console.error("Error generating AI response:", error.message);
      throw new Error(
        "There was an issue generating the response. Please try again later."
      );
    }

    console.error("An unknown error occurred:", error);
    throw new Error("An unexpected error occurred. Please try again.");
  }
}
