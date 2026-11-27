import { createDeepSeek } from "@ai-sdk/deepseek";
import type { LanguageModel } from "ai";
import { db } from "@crm/db";
import { DEFAULT_AGENT_MODEL, readAgentModel } from "@crm/db/settings";

export interface ModelSelection {
	model: string;
	modelContextWindowTokens: number;
}

export async function selectedModel(): Promise<ModelSelection> {
	try {
		const setting = await readAgentModel(db);

		return {
			model: setting.id,
			modelContextWindowTokens: setting.contextWindowTokens,
		};
	} catch (error) {
		console.error(
			`[agent] could not read the configured model, falling back: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		return {
			model: DEFAULT_AGENT_MODEL.id,
			modelContextWindowTokens: DEFAULT_AGENT_MODEL.contextWindowTokens,
		};
	}
}

// Afrique Academy fork: with DEEPSEEK_API_KEY set, every model call goes straight to the
// DeepSeek API instead of the Vercel AI Gateway (the Settings model is then ignored).
// eve takes a live LanguageModel only from `step.started` (session and turn selections
// must be gateway ids), so each agent adds a step hook, and compaction gets the same model.
// @ai-sdk/deepseek is added in deploy/agent.Dockerfile (no lockfile change upstream).
const DEEPSEEK_CONTEXT_WINDOW_TOKENS = 1_000_000;
const deepseek = process.env.DEEPSEEK_API_KEY
	? createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY })
	: null;
const deepseekModelId = process.env.DEEPSEEK_MODEL || "deepseek-flash";

export interface DirectModel {
	model: LanguageModel;
	modelContextWindowTokens: number;
}

export function directModel(): DirectModel | null {
	return deepseek
		? {
				model: deepseek(deepseekModelId),
				modelContextWindowTokens: DEEPSEEK_CONTEXT_WINDOW_TOKENS,
			}
		: null;
}

export function directCompaction(): { compaction?: DirectModel } {
	return deepseek
		? {
				compaction: {
					model: deepseek(deepseekModelId),
					modelContextWindowTokens: DEEPSEEK_CONTEXT_WINDOW_TOKENS,
				},
			}
		: {};
}
