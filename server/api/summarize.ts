import {
  generateText,
  experimental_generateSpeech as generateSpeech,
  type gateway,
} from "ai";
import { elevenlabs } from "@ai-sdk/elevenlabs";

type ModelId = Parameters<typeof gateway>[0];

export async function POST(request: Request) {
  const { text, url, title } = await request.json();

  const { text: summary } = await generateText({
    model: "xai/grok-4-fast-reasoning" satisfies ModelId,
    system:
      "You are a webpage content summarizer. You are given a webpage (text, url, title) and you create a compelling trailer-like overview (max 50 words) that captures the main ideas and explains what readers will find valuable. Present the content in an engaging way that highlights the key insights and practical value without being overly promotional. Focus on what the page actually offers and why it matters. Use clear, conversational language that flows naturally when spoken aloud, as this summary will be read out loud as audio. Return only the summary (just text, no headings, no titles, no markdown), nothing else!",
    prompt: JSON.stringify({ text, url, title }),
  });

  const { audio } = await generateSpeech({
    model: elevenlabs.speech("eleven_flash_v2_5"),
    text: summary,
    // voice: "..." // use a custom voice!
  });

  return new Response(audio.uint8Array, {
    headers: {
      "Content-Type": audio.mediaType || "audio/mpeg",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// DO NOT DELETE - NECESSARY FOR CORS
export async function OPTIONS(_: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
