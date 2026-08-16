import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (client) return client;

  const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;

  if (!baseURL || !apiKey) {
    throw new Error(
      "AI_INTEGRATIONS_ANTHROPIC_BASE_URL and AI_INTEGRATIONS_ANTHROPIC_API_KEY must be set to use the Anthropic AI integration.",
    );
  }

  client = new Anthropic({ apiKey, baseURL });
  return client;
}

/**
 * Lazily-initialized Anthropic client.
 *
 * The client is created (and env vars validated) on first use instead of at
 * module load, so importing this module doesn't crash the API server when the
 * AI integration hasn't been provisioned. Routes that actually call the AI
 * wrap their usage in try/catch and surface a clear error.
 */
export const anthropic = new Proxy({} as Anthropic, {
  get(_target, prop) {
    const c = getClient();
    const value = (c as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? (value as Function).bind(c) : value;
  },
});
