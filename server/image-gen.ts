import fetch from "node-fetch";
import type { RequestInit, Response } from "node-fetch";

// Hugging Face Inference API - FREE tier
// Using Stable Diffusion XL - works without API key!
const HF_API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";
const HF_TOKEN = process.env.HUGGINGFACE_API_KEY || ""; // Optional for faster processing

interface ImageGenOptions {
  prompt: string;
  negative_prompt?: string;
}

// Style wrapper - force MNEX aesthetic on all images
function wrapPromptWithMNEXStyle(userPrompt: string): string {
  const mnexStyle = "purple glowing energy, mystical cyberpunk, neural network patterns, dark cosmic background, ethereal glow, futuristic holographic, high tech oracle visualization";
  const negative = "realistic photo, bland, bright daylight, ordinary, normal colors, simple";
  
  // Combine user intent with MNEX aesthetic
  return `${userPrompt}, ${mnexStyle}`;
}

export async function generateImage(prompt: string): Promise<Buffer | null> {
  try {
    const styledPrompt = wrapPromptWithMNEXStyle(prompt);
    console.log(`[IMAGE-GEN] Original: "${prompt}"`);
    console.log(`[IMAGE-GEN] MNEX Style: "${styledPrompt}"`);

    const payload = {
      inputs: styledPrompt,
      parameters: {
        num_inference_steps: 30, // More steps for better quality
        guidance_scale: 8.0, // Stronger adherence to prompt
        negative_prompt: "realistic photo, bright colors, daylight, ordinary, simple, bland, boring"
      }
    };

    const headers: any = {
      "Content-Type": "application/json",
    };

    if (HF_TOKEN) {
      headers["Authorization"] = `Bearer ${HF_TOKEN}`;
    }

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    } as RequestInit);

    if (!response.ok) {
      console.error(`[IMAGE-GEN] API error: ${response.status}`);
      return null;
    }

    const buffer = await response.buffer();
    console.log(`[IMAGE-GEN] Success! Size: ${buffer.length} bytes`);
    
    return buffer;
  } catch (err) {
    console.error("[IMAGE-GEN] Error:", err);
    return null;
  }
}

export function detectImageRequest(message: string): string | null {
  const lower = message.toLowerCase();
  
  // Detect image generation requests
  const triggers = [
    /generate (?:an? )?image (?:of |about |showing )?(.+)/i,
    /create (?:an? )?image (?:of |about |showing )?(.+)/i,
    /make (?:an? )?image (?:of |about |showing )?(.+)/i,
    /draw (?:an? )?image (?:of |about |showing )?(.+)/i,
    /show me (?:an? )?image (?:of |about |showing )?(.+)/i,
    /generate (.+) image/i,
    /create (.+) image/i,
  ];

  for (const regex of triggers) {
    const match = message.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

