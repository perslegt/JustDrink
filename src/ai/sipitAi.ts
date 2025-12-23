// src/ai/sipitAi.ts
import type { Language } from "../i18n/translations";

export type AiCategory = "normal" | "duo" | "multi" | "challenge" | "vote" | "chain" | "rule";

export type AiPrompt = {
  category: AiCategory;
  text_nl: string;
  text_en: string;
  fallback?: boolean;
};

const API_URL = "http://localhost:3000/api/sipit-generate";
// Later vervang je dit door je Vercel URL (prod).

export async function fetchAiPrompt(category: AiCategory, playerCount: number): Promise<AiPrompt> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, playerCount }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function aiPromptToText(p: AiPrompt, lang: Language) {
  return lang === "nl" ? p.text_nl : p.text_en;
}

export function aiPromptId(p: AiPrompt) {
  return `${p.category}:${p.text_nl}`;
}
