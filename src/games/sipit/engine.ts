import type { Language } from "../../i18n/translations";
import { PROMPTS, renderPrompt, type Category, type PromptTemplate } from "./prompts";

export type ActiveTimedEffect = {
  type: "buddies";
  remainingTurns: number;
};

export type ActiveRule = {
  key: string;
  label: string;
  remainingTurns: number;
};

export type SipItState = {
  players: string[];
  effects: ActiveTimedEffect[];
  buddiesPair: [string, string] | null;
  activeRules: ActiveRule[];
};

export type GeneratedPrompt = {
  text: string;
  category: Category;
  activeRules: ActiveRule[];
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickDistinct(players: string[], n: number): string[] {
  const pool = [...players];
  const picked: string[] = [];
  for (let i = 0; i < n && pool.length > 0; i++) {
    const idx = randInt(0, pool.length - 1);
    picked.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picked;
}

function hasEffect(state: SipItState, type: ActiveTimedEffect["type"]) {
  return state.effects.some((e) => e.type === type);
}

function tickEffects(state: SipItState) {
  state.effects = state.effects
    .map((e) => ({ ...e, remainingTurns: e.remainingTurns - 1 }))
    .filter((e) => e.remainingTurns > 0);
}

function stripRulePrefix(label: string) {
  return label.replace(/^REGEL:\s*/i, "").replace(/^RULE:\s*/i, "");
}

function tickRules(state: SipItState): ActiveRule | null {
  state.activeRules = state.activeRules.map((r) => ({ ...r, remainingTurns: r.remainingTurns - 1 }));
  const expired = state.activeRules.find((r) => r.remainingTurns <= 0) ?? null;
  if (expired) state.activeRules = state.activeRules.filter((r) => r.key !== expired.key);
  return expired;
}

function findEffectTpl(effect: NonNullable<PromptTemplate["effect"]>) {
  const tpl = PROMPTS.find((p) => p.effect === effect);
  if (!tpl) throw new Error(`Missing prompt template for effect: ${effect}`);
  return tpl;
}

function startBuddies(state: SipItState): [string, string] | null {
  if (state.players.length < 2) return null;

  const pair = pickDistinct(state.players, 2);
  if (pair.length < 2) return null;

  state.buddiesPair = [pair[0], pair[1]];
  state.effects.push({ type: "buddies", remainingTurns: randInt(20, 50) });
  return state.buddiesPair;
}

function endBuddies(state: SipItState): [string, string] | null {
  const pair = state.buddiesPair;
  state.buddiesPair = null;
  state.effects = state.effects.filter((e) => e.type !== "buddies");
  return pair;
}

function addRule(state: SipItState, rule: { key: string; label: string; minTurns?: number; maxTurns?: number }) {
  if (state.activeRules.some((r) => r.key === rule.key)) return;

  state.activeRules.push({
    key: rule.key,
    label: rule.label,
    remainingTurns: randInt(rule.minTurns ?? 20, rule.maxTurns ?? 50),
  });
}

export function createSipItState(players: string[]): SipItState {
  return {
    players: [...players],
    effects: [],
    buddiesPair: null,
    activeRules: [],
  };
}

export function nextPrompt(state: SipItState, language: Language): GeneratedPrompt {
  // 1) tick rules: als er één afloopt, toon meteen een "rule_off"
  const expiredRule = tickRules(state);
  if (expiredRule) {
    const lifted =
      language === "nl"
        ? `REGEL OPGEHEVEN: ${stripRulePrefix(expiredRule.label)}`
        : `RULE LIFTED: ${stripRulePrefix(expiredRule.label)}`;

    return { text: lifted, category: "rule", activeRules: [...state.activeRules] };
  }

  // 2) tick effects (buddies)
  const buddiesWasActive = hasEffect(state, "buddies");
  tickEffects(state);
  const buddiesIsActive = hasEffect(state, "buddies");

  if (buddiesWasActive && !buddiesIsActive) {
    const endedPair = endBuddies(state);
    const tpl = findEffectTpl("buddies_off");
    const text = renderPrompt(tpl, language, {
      pick: () => [],
      buddiesPair: state.buddiesPair,
      endedBuddiesPair: endedPair ?? null,
    });
    return { text, category: tpl.category, activeRules: [...state.activeRules] };
  }

  // 3) kans om een nieuwe rule te starten (meerdere tegelijk mogelijk)
  //    candidates: no_names (effect) + andere rule_on zonder effect
  if (state.activeRules.length < 3 && Math.random() < 0.03) {
    const ruleCandidates = PROMPTS.filter((p) => p.category === "rule");

    if (ruleCandidates.length > 0) {
      // maak candidates uniek op label (zodat geen duplicates)
      const available = ruleCandidates.filter((tpl) => {
        const label = renderPrompt(tpl, language, { pick: () => [], buddiesPair: state.buddiesPair });
        const key = `rule_${label}`;
        return !state.activeRules.some((r) => r.key === key);
      });

      if (available.length > 0) {
        const picked = available[randInt(0, available.length - 1)];
        const label = renderPrompt(picked, language, { pick: () => [], buddiesPair: state.buddiesPair });
        const key = `rule_${label}`;

        addRule(state, { key, label });

        // Toon de regel zelf (jouw tekst begint al met REGEL:)
        return { text: label, category: "rule", activeRules: [...state.activeRules] };
      }
    }
  }


  // 4) buddies starten (los van rules)
  if (!buddiesIsActive && Math.random() < 0.03) {
    const pair = startBuddies(state);
    const tpl = findEffectTpl("buddies_on");
    const text = renderPrompt(tpl, language, {
      pick: () => (pair ? [pair[0], pair[1]] : []),
      buddiesPair: pair ?? null,
    });
    return { text, category: tpl.category, activeRules: [...state.activeRules] };
  }

  // 5) normale prompt pool (quiz uit)
  const normalPool = PROMPTS.filter((p) => !p.effect && p.category !== "quiz");
  const tpl = normalPool[randInt(0, normalPool.length - 1)];

  const text = renderPrompt(tpl, language, {
    pick: (n: number) => pickDistinct(state.players, n),
    buddiesPair: state.buddiesPair,
  });

  return { text, category: tpl.category, activeRules: [...state.activeRules] };
}
