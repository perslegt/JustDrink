import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AiCategory, AiPrompt } from "./sipitAi";
import { aiPromptId, fetchAiPrompt } from "./sipitAi";

type PromptFeedback = {
  upvotes: number;
  downvoted: boolean;
};

const FEEDBACK_KEY = "sipit_prompt_feedback_v1";

async function loadFeedback(): Promise<Record<string, PromptFeedback>> {
  try {
    const raw = await AsyncStorage.getItem(FEEDBACK_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const CATEGORIES: AiCategory[] = ["normal", "duo", "multi", "challenge", "vote", "chain", "rule"];

export class AiPromptQueue {
  private queues: Record<AiCategory, AiPrompt[]> = {
    normal: [],
    duo: [],
    multi: [],
    challenge: [],
    vote: [],
    chain: [],
    rule: [],
  };

  private filling: Partial<Record<AiCategory, boolean>> = {};

  constructor(private min = 2, private batch = 3) {}

  getSize(category: AiCategory) {
    return this.queues[category].length;
  }

  clear(category?: AiCategory) {
    if (!category) {
      for (const c of CATEGORIES) this.queues[c] = [];
      return;
    }
    this.queues[category] = [];
  }

  async ensure(category: AiCategory, playerCount: number) {
    // basic guard: don't fill impossible categories
    if (category === "multi" && playerCount < 3) return;
    if ((category === "vote" || category === "chain") && playerCount < 3) return;

    if (this.filling[category]) return;
    if (this.queues[category].length >= this.min) return;

    this.filling[category] = true;
    try {
      const feedback = await loadFeedback();
      const added: AiPrompt[] = [];

      for (let i = 0; i < this.batch; i++) {
        try {
          const p = await fetchAiPrompt(category, playerCount);
          const id = aiPromptId(p);
          if (feedback[id]?.downvoted) continue;
          added.push(p);
        } catch {
          // ignore individual errors
        }
      }

      this.queues[category].push(...added);
    } finally {
      this.filling[category] = false;
    }
  }

  async get(category: AiCategory, playerCount: number): Promise<AiPrompt | null> {
    await this.ensure(category, playerCount);
    return this.queues[category].shift() ?? null;
  }

  // optional: prefill a bunch of categories at once
  async warm(playerCount: number, cats: AiCategory[] = ["normal", "duo", "multi"]) {
    for (const c of cats) {
      // fire and forget; we don't await sequentially per se, but keep it simple
      // (If you want parallel later: Promise.all)
      await this.ensure(c, playerCount);
    }
  }
}
