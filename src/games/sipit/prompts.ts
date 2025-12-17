import type { Language } from "../../i18n/translations";

export type Category =
  | "normal"
  | "duo"
  | "challenge"
  | "vote"
  | "quiz"
  | "chain"
  | "rule_on"
  | "rule_off"
  | "buddies_on"
  | "buddies_off";

export type PromptBuildCtx = {
  pick: (n: number) => string[];
  buddiesPair: [string, string] | null;
  endedBuddiesPair?: [string, string] | null;
};

export type PromptTemplate = {
  category: Category;

  // texts per taal, met simpele placeholders
  text: Record<Language, string>;

  // welke placeholders moeten gevuld worden?
  fill?: (ctx: PromptBuildCtx) => Record<string, string>;

  // optioneel effect-label zodat engine weet wat dit is
  effect?: "no_names_on" | "no_names_off" | "buddies_on" | "buddies_off";
};

export function renderPrompt(tpl: PromptTemplate, lang: Language, ctx: PromptBuildCtx) {
  const template = tpl.text[lang];
  const vars = tpl.fill ? tpl.fill(ctx) : {};
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

export const PROMPTS: PromptTemplate[] = [
  {
    category: "normal",
    text: {
      nl: "{a} moet een slok nemen.",
      en: "{a} takes a sip.",
    },
    fill: ({ pick }) => ({ a: pick(1)[0] ?? "?" }),
  },
  {
    category: "duo",
    text: {
      nl: "{a} en {b} nemen samen een slok.",
      en: "{a} and {b} take a sip together.",
    },
    fill: ({ pick }) => {
      const [a, b] = pick(2);
      return { a: a ?? "?", b: b ?? "?" };
    },
  },

  // challenge
  {
    category: "challenge",
    text: {
      nl: "{a}: doe 10 squats, anders 2 slokken.",
      en: "{a}: do 10 squats, or take 2 sips.",
    },
    fill: ({ pick }) => ({ a: pick(1)[0] ?? "?" }),
  },

  // vote
  {
    category: "vote",
    text: {
      nl: "STEM: Wie is het meest likely om te laat te komen? Verliezer drinkt.",
      en: "VOTE: Who is most likely to be late? Loser drinks.",
    },
  },

  // quiz
  {
    category: "quiz",
    text: {
      nl: "{a}: Waar of niet waar? Bij fout: 2 slokken.",
      en: "{a}: True or false? If wrong: 2 sips.",
    },
    fill: ({ pick }) => ({ a: pick(1)[0] ?? "?" }),
  },

  // chain
  {
    category: "chain",
    text: {
      nl: "KETTING: Om de beurt noem je een biermerk. Wie faalt: 2 slokken.",
      en: "CHAIN: Take turns naming a beer brand. First to fail: 2 sips.",
    },
  },

  // no-names rule on/off (timed)
  {
    category: "rule_on",
    effect: "no_names_on",
    text: { nl: "REGEL: Geen namen meer zeggen!", en: "RULE: No names allowed!" },
  },
  {
    category: "rule_off",
    effect: "no_names_off",
    text: { nl: "REGEL OPGEHEVEN: Namen mogen weer.", en: "RULE LIFTED: Names are allowed again." },
  },

  // drink buddies on/off (timed, with remembered names)
  {
    category: "buddies_on",
    effect: "buddies_on",
    text: {
      nl: "DRINKMAATJES: {a} & {b} zijn drinkmaatjes!",
      en: "DRINK BUDDIES: {a} & {b} are drink buddies!",
    },
    fill: ({ pick }) => {
      const [a, b] = pick(2);
      return { a: a ?? "?", b: b ?? "?" };
    },
  },
  {
    category: "buddies_off",
    effect: "buddies_off",
    text: {
      nl: "DRINKMAATJES OPGEHEVEN: {a} & {b} zijn geen drinkmaatjes meer.",
      en: "BUDDIES ENDED: {a} & {b} are no longer drink buddies.",
    },
    fill: ({ endedBuddiesPair, buddiesPair }) => {
      const pair = endedBuddiesPair ?? buddiesPair;
      return { a: pair?.[0] ?? "?", b: pair?.[1] ?? "?" };
    },
  },
];
