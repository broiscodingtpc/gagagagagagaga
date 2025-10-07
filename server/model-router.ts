// Multi-model router for different tasks
// Free tier allows testing without limits

export interface ModelConfig {
  id: string;
  name: string;
  maxTokens: number;
  temperature: number;
  rpm: number; // requests per minute
  tpm: number; // tokens per minute
}

export const GROQ_MODELS: Record<string, ModelConfig> = {
  // Fast responses - default
  "llama-3.3-70b-versatile": {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B",
    maxTokens: 32768,
    temperature: 0.7,
    rpm: 30,
    tpm: 12000
  },
  
  // Ultra-fast for quick queries
  "llama-3.1-8b-instant": {
    id: "llama-3.1-8b-instant",
    name: "Llama 3.1 8B Instant",
    maxTokens: 131072,
    temperature: 0.7,
    rpm: 30,
    tpm: 6000
  },
  
  // Complex reasoning
  "openai/gpt-oss-120b": {
    id: "openai/gpt-oss-120b",
    name: "GPT-OSS 120B",
    maxTokens: 65536,
    temperature: 0.7,
    rpm: 30,
    tpm: 8000
  },
  
  // Lighter model for simple tasks
  "openai/gpt-oss-20b": {
    id: "openai/gpt-oss-20b",
    name: "GPT-OSS 20B",
    maxTokens: 65536,
    temperature: 0.7,
    rpm: 30,
    tpm: 8000
  }
};

export function selectModel(message: string): ModelConfig {
  const lower = message.toLowerCase();
  
  // Complex reasoning tasks
  if (
    lower.includes("explain") ||
    lower.includes("analyze") ||
    lower.includes("compare") ||
    lower.includes("philosophy") ||
    lower.includes("deep dive")
  ) {
    return GROQ_MODELS["openai/gpt-oss-120b"];
  }
  
  // Quick queries
  if (
    lower.length < 50 ||
    lower.includes("what is") ||
    lower.includes("who is") ||
    lower.includes("define")
  ) {
    return GROQ_MODELS["llama-3.1-8b-instant"];
  }
  
  // Default: balanced model
  return GROQ_MODELS["llama-3.3-70b-versatile"];
}

export function getModelStats(): string {
  return Object.values(GROQ_MODELS)
    .map(m => `${m.name}: ${m.rpm} RPM, ${m.tpm} TPM`)
    .join("\n");
}

