import type { Language } from "../../i18n/translations";
import { PROMPTS, renderPrompt, type Category, type PromptTemplate } from "./prompts";

export type ActiveTimedEffect = {
  type: "no_names" | "buddies";
  remainingTurns: number;
};

export type SipItState = {
  players: string[];
  effects: ActiveTimedEffect[];
  buddiesPair: [string, string] | null; // ✅ onthouden
};

export type GeneratedPrompt = {
  text: string;
  category: Category;
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

function findEffectTpl(effect: NonNullable<PromptTemplate["effect"]>) {
  const tpl = PROMPTS.find((p) => p.effect === effect);
  if (!tpl) throw new Error(`Missing prompt template for effect: ${effect}`);
  return tpl;
}

function startNoNames(state: SipItState) {
  state.effects.push({ type: "no_names", remainingTurns: randInt(3, 8) });
}

function clearNoNames(state: SipItState) {
  state.effects = state.effects.filter((e) => e.type !== "no_names");
}

function startBuddies(state: SipItState): [string, string] | null {
  if (state.players.length < 2) return null;

  const pair = pickDistinct(state.players, 2);
  if (pair.length < 2) return null;

  state.buddiesPair = [pair[0], pair[1]];
  state.effects.push({ type: "buddies", remainingTurns: randInt(4, 10) });
  return state.buddiesPair;
}

function clearBuddiesEffect(state: SipItState) {
  state.effects = state.effects.filter((e) => e.type !== "buddies");
}

function endBuddies(state: SipItState): [string, string] | null {
  const pair = state.buddiesPair;
  state.buddiesPair = null;
  clearBuddiesEffect(state);
  return pair;
}

export function createSipItState(players: string[]): SipItState {
  return {
    players: [...players],
    effects: [],
    buddiesPair: null,
  };
}

/**
 * Genereer de volgende prompt:
 * - Timers tikken
 * - Als buddies/no_names aflopen -> meteen OFF prompt (met namen waar nodig)
 * - Soms starten we rules/buddies
 * - Anders kiezen we een normale prompt
 */
export function nextPrompt(state: SipItState, language: Language): GeneratedPrompt {
  // 1) onthoud status vóór tick
  const noNamesWasActive = hasEffect(state, "no_names");
  const buddiesWasActive = hasEffect(state, "buddies");

  // 2) tick timers
  tickEffects(state);

  const noNamesIsActive = hasEffect(state, "no_names");
  const buddiesIsActive = hasEffect(state, "buddies");

  // 3) Buddies net afgelopen -> buddies_off met herinnerde namen
  if (buddiesWasActive && !buddiesIsActive) {
    const endedPair = endBuddies(state);
    const tpl = findEffectTpl("buddies_off");
    const text = renderPrompt(tpl, language, {
      pick: () => [],
      buddiesPair: state.buddiesPair,
      endedBuddiesPair: endedPair ?? null,
    });
    return { text, category: tpl.category };
  }

  // 4) No-names net afgelopen -> rule_off
  if (noNamesWasActive && !noNamesIsActive) {
    clearNoNames(state);
    const tpl = findEffectTpl("no_names_off");
    const text = renderPrompt(tpl, language, {
      pick: () => [],
      buddiesPair: state.buddiesPair,
    });
    return { text, category: tpl.category };
  }

  // 5) kans om effecten te starten
  const roll = Math.random();

  if (!noNamesIsActive && roll < 0.08) {
    startNoNames(state);
    const tpl = findEffectTpl("no_names_on");
    const text = renderPrompt(tpl, language, {
      pick: () => [],
      buddiesPair: state.buddiesPair,
    });
    return { text, category: tpl.category };
  }

  if (!buddiesIsActive && roll > 0.92) {
    const pair = startBuddies(state);
    const tpl = findEffectTpl("buddies_on");
    const text = renderPrompt(tpl, language, {
      // buddies_on prompt gebruikt 2 namen: we geven die via pick terug
      pick: () => (pair ? [pair[0], pair[1]] : []),
      buddiesPair: pair ?? null,
    });
    return { text, category: tpl.category };
  }

  // 6) normale prompts (effect-templates uitsluiten)
  const normalPool = PROMPTS.filter((p) => !p.effect);
  const tpl = normalPool[randInt(0, normalPool.length - 1)];

  const ctx = {
    pick: (n: number) => pickDistinct(state.players, n),
    buddiesPair: state.buddiesPair,
  };

  const text = renderPrompt(tpl, language, ctx);
  return { text, category: tpl.category };
}
