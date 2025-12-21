import type { Language } from "../../i18n/translations";

export type Category =
  | "normal"
  | "duo"
  | "challenge"
  | "vote"
  | "quiz"
  | "chain"
  | "rule"
  | "buddies_on"
  | "buddies_off";

export const CATEGORY_WEIGHT: Record<Category, number> = {
  normal: 20,
  duo: 16,
  challenge: 2,
  vote: 2,
  chain: 1,
  rule: 0, // via effect
  buddies_on: 0, // via effect
  buddies_off: 0, // via effect
  quiz: 0,
};


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
  weight?: number;
};

export function renderPrompt(tpl: PromptTemplate, lang: Language, ctx: PromptBuildCtx) {
  const template = tpl.text[lang];
  const vars = tpl.fill ? tpl.fill(ctx) : {};
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

export const PROMPTS: PromptTemplate[] = [
  // =========================
  // NORMAL (veel)
  // =========================
  {
    category: "normal",
    text: { nl: "{a} moet 1 slok nemen.", en: "{a} takes 1 sip." },
    fill: ({ pick }) => ({ a: pick(1)[0] ?? "?" }),
  },
  {
    category: "normal",
    text: { nl: "{a} moet 2 slokken nemen.", en: "{a} takes 2 sips." },
    fill: ({ pick }) => ({ a: pick(1)[0] ?? "?" }),
  },
  {
    category: "normal",
    text: { nl: "{a} deelt 2 slokken uit.", en: "{a} gives out 2 sips." },
    fill: ({ pick }) => ({ a: pick(1)[0] ?? "?" }),
  },
  {
    category: "normal",
    text: { nl: "{a} deelt 3 slokken uit.", en: "{a} gives out 3 sips." },
    fill: ({ pick }) => ({ a: pick(1)[0] ?? "?" }),
  },
  {
    category: "normal",
    text: {
      nl: "{a} kiest iemand. Die persoon neemt 2 slokken.",
      en: "{a} picks someone. That person takes 2 sips.",
    },
    fill: ({ pick }) => ({ a: pick(1)[0] ?? "?" }),
  },
  {
    category: "normal",
    text: {
      nl: "Degene met de laagste batterij: 2 slokken.",
      en: "Whoever has the lowest phone battery: 2 sips.",
    },
  },
  {
  category: "normal",
    text: {
      nl: "Iedereen die morgen ‘vroeg’ moet opstaan: 2 slokken.",
      en: "Anyone who has to get up early tomorrow: 2 sips.",
    },
  },
  {
    category: "normal",
    text: {
      nl: "Degene met de hoogste batterij: deelt 2 slokken uit.",
      en: "Highest phone battery gives out 2 sips.",
    },
  },
  {
    category: "normal",
    text: {
      nl: "Iedereen met witte sokken: 1 slok.",
      en: "Anyone wearing white socks: 1 sip.",
    },
  },
  {
    category: "normal",
    text: {
      nl: "Iedereen die rookt: 2 slokken.",
      en: "Anyone who smokes: 2 sips.",
    },
  },
  {
    category: "normal",
    text: {
      nl: "Iedereen met een huisdier: 1 slok.",
      en: "Anyone who has a pet: 1 sip.",
    },
  },
  {
    category: "normal",
    text: {
      nl: "Alle mannen: 1 slok.",
      en: "All men: 1 sip.",
    },
  },
  {
    category: "normal",
    text: {
      nl: "Alle vrouwen: 1 slok.",
      en: "All women: 1 sip.",
    },
  },
  {
    category: "normal",
    text: {
      nl: "Alle studenten: 1 slok.",
      en: "All students: 1 sip.",
    },
  },
  {
    category: "normal",
    text: {
      nl: "Als je vandaag hebt gewerkt: 2 slokken",
      en: "If you worked today: 2 sips",
    },
  },
  {
    category: "normal",
    text: {
      nl: "Als je morgen vroeg op moet: 2 slokken.",
      en: "If you have to get up early tomorrow: 2 sips.",
    },
  },
  {
    category: "normal",
    text: {
      nl: "Ben je langer dan 1.90m? Neem 1 slok.",
      en: "Are you taller than 1.90m? Take 1 sip.",
    },
  },
  {
    category: "normal",
    text: {
      nl: "Degene die het verst van hier woont: 2 slokken.",
      en: "Whoever lives farthest from here: 2 sips.",
    },
  },
  {
    category: "normal",
    text: {
      nl: "Degene met nikes aan: 1 slok.",
      en: "Whoever has nikes on: 1 sip.",
    },
  },
  {
    category: "normal",
    text: {
      nl: "{a} mag 1 slok weggeven of zelf nemen. Kies slim.",
      en: "{a} can give 1 sip away or take it. Choose wisely.",
    },
    fill: ({ pick }) => ({ a: pick(1)[0] ?? "?" }),
  },

  // =========================
  // DUO (veel)
  // =========================
  {
    category: "duo",
    text: {
      nl: "{a} en {b}: cheers! Neem samen 1 slok.",
      en: "{a} and {b}: cheers! Take 1 sip together."
    },
    fill: ({ pick }) => {
      const [a, b] = pick(2);
      return { a: a ?? "?", b: b ?? "?" };
    },
  },
  {
    category: "duo",
    text: {
      nl: "{a} en {b}: steen-papier-schaar. Verliezer 2 slokken.",
      en: "{a} and {b}: rock-paper-scissors. Loser takes 2 sips."
    },
    fill: ({ pick }) => {
      const [a, b] = pick(2);
      return { a: a ?? "?", b: b ?? "?" };
    },
  },
  {
    category: "duo",
    text: {
      nl: "{a} noemt een categorie. {b} moet 3 dingen noemen. Fout = 2 slokken.",
      en: "{a} picks a category. {b} names 3 things. Fail = 2 sips."
    },
    fill: ({ pick }) => {
      const [a, b] = pick(2);
      return { a: a ?? "?", b: b ?? "?" };
    },
  },
  {
    category: "duo",
    text: {
      nl: "Als {a} ouder is dan {b}, neemt {a} 2 slokken. Anders {b}.",
      en: "If {a} is older than {b}, {a} takes 2 sips. Otherwise {b}."
    },
    fill: ({ pick }) => {
      const [a, b] = pick(2);
      return { a: a ?? "?", b: b ?? "?" };
    },
  },
  {
    category: "duo",
    text: {
      nl: "{a} en {b}: zeg tegelijk een getal van 1–10. Zelfde getal? Beide 2 slokken.",
      en: "{a} and {b}: say a number from 1–10 at the same time. Same number? Both take 2 sips."
    },
    fill: ({ pick }) => {
      const [a, b] = pick(2);
      return { a: a ?? "?", b: b ?? "?" };
    },
  },
  {
    category: "duo",
    text: {
      nl: "{a} en {b}: hoedje van de koning. Verliezer neemt 2 slokken.",
      en: "{a} and {b}: king's hat. Loser takes 2 sips."
    },
    fill: ({ pick }) => {
      const [a, b] = pick(2);
      return { a: a ?? "?", b: b ?? "?" };
    },
  },
  {
    category: "duo",
    text: {
      nl: "{a} en {b}: Kop of munt. Verliezer neemt 2 slokken.",
      en: "{a} and {b}: heads or tails. Loser takes 2 sips."
    },
    fill: ({ pick }) => {
      const [a, b] = pick(2);
      return { a: a ?? "?", b: b ?? "?" };
    },
  },
  {
    category: "duo",
    text: {
      nl: "{a} en {b}: noem tegelijk een kleur. Verschillend? Beide 1 slok.",
      en: "{a} and {b}: say a color at the same time. Different? Both take 1 sip.",
    },
    fill: ({ pick }) => {
      const [a, b] = pick(2);
      return { a: a ?? "?", b: b ?? "?" };
    },
  },

  // =========================
  // CHALLENGE (veel)
  // =========================
  {
    category: "challenge",
    text: {
      nl: "{a}: raak je tenen (zonder knieën te buigen). Lukt niet? 2 slokken.",
      en: "{a}: touch your toes (no bent knees). Fail? 2 sips."
    },
    fill: ({ pick }) => ({ a: pick(1)[0] ?? "?" }),
  },
  {
    category: "challenge",
    text: {
      nl: "{a}: zeg het alfabet achterstevoren tot en met T. Fout = 2 slokken.",
      en: "{a}: say the alphabet backwards until T. Fail = 2 sips."
    },
    fill: ({ pick }) => ({ a: pick(1)[0] ?? "?" }),
  },
  {
    category: "challenge",
    text: {
      nl: "{a}: Spel {b} zijn naam achterstevoren zonder nadenken. Fout = 2 slokken.",
      en: "{a}: Say {b}'s name backwards without thinking. Fail = 2 sips."
    },
    fill: ({ pick }) => {
      const [a, b] = pick(2);
      return { a: a ?? "?", b: b ?? "?" };
    },
  },

  // =========================
  // VOTE (veel)
  // =========================
  {
    category: "vote",
    text: {
      nl: "Wie is het meest likely om te laat te komen? Verliezer drinkt 2 slokken.",
      en: "Who is most likely to be late? Loser drinks 2 sips."
    },
  },
  {
    category: "vote",
    text: {
      nl: "Wie zou het langst overleven in een zombie-apocalyps? Verliezer 2 slokken.",
      en: "Who would survive longest in a zombie apocalypse? Loser 2 sips."
    },
  },
  {
    category: "vote",
    text: {
      nl: "Wie zou als eerste trouwen? Verliezer 2 slokken.",
      en: "Who will get married first? Loser 2 sips."
    },
  },
  {
    category: "vote",
    text: {
      nl: "Wie wordt het snelst dronken? Verliezer 2 slokken.",
      en: "Who gets drunk fastest? Loser 2 sips."
    },
  },
  {
    category: "vote",
    text: {
      nl: "Wie kan het slechtst liegen? Verliezer 2 slokken.",
      en: "Who is the worst liar? Loser 2 sips."
    },
  },

  // =========================
  // CHAIN (veel)
  // =========================
  {
    category: "chain",
    text: {
      nl: "Om de beurt noem je een biermerk. Wie faalt: 2 slokken.",
      en: "Take turns naming a beer brand. First to fail: 2 sips."
    },
  },
  {
    category: "chain",
    text: {
      nl: "Om de beurt noem je een land. Geen herhaling. Wie faalt: 2 slokken.",
      en: "Take turns naming a country. No repeats. Fail: 2 sips."
    },
  },
  {
    category: "chain",
    text: {
      nl: "Om de beurt noem je een artiest/DJ. Wie faalt: 2 slokken.",
      en: "Take turns naming an artist/DJ. Fail: 2 sips."
    },
  },
  {
    category: "chain",
    text: {
      nl: "Om de beurt noem je een film. Wie faalt: 2 slokken.",
      en: "Take turns naming a movie. Fail: 2 sips."
    },
  },
  {
    category: "chain",
    text: {
      nl: "Om de beurt noem je een sport. Wie faalt: 2 slokken.",
      en: "Take turns naming a sport. Fail: 2 sips."
    },
  },
  // =========================
  // RULES (timed no-names via effect)
  // + losse “regel” prompts (wie faalt drinkt)
  // =========================
  {
    category: "rule",
    text: {
      nl: "REGEL: Geen namen meer zeggen!",
      en: "RULE: No names allowed!"
    },
  },
  {
    category: "rule",
    text: {
      nl: "REGEL: Niet wijzen. Wie wijst: 1 slok.",
      en: "RULE: No pointing. If you point: 1 sip."
    },
  },
  {
    category: "rule",
    text: {
      nl: "REGEL: Drink met links. Vergeet je dat: 1 slok.",
      en: "RULE: Drink with your left hand. Forget? 1 sip."
    },
  },
  {
    category: "rule",
    text: {
      nl: "REGEL: Niet lachen. Lach je: 2 slokken.",
      en: "RULE: No laughing. If you laugh: 2 sips."
    },
  },
  {
    category: "rule",
    text: {
      nl: "REGEL: Geen scheldwoorden. Overtreding: 2 slokken.",
      en: "RULE: No swearing. Break it: 2 sips."
    },
  },
  {
    category: "rule",
    text: {
      nl: "REGEL: Geen telefoons. Pak je ‘m? 2 slokken.",
      en: "RULE: No phones. Touch it? 2 sips."
    },
  },

  // =========================
  // BUDDIES (timed; engine zorgt voor pair + off met pair)
  // =========================
  {
    category: "buddies_on",
    effect: "buddies_on",
    text: {
      nl: "{a} & {b} zijn drinkmaatjes!",
      en: "{a} & {b} are drink buddies!"
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
      nl: "{a} & {b} zijn geen drinkmaatjes meer.",
      en: "{a} & {b} are no longer drink buddies.",
    },
    fill: ({ endedBuddiesPair, buddiesPair }) => {
      const pair = endedBuddiesPair ?? buddiesPair;
      return { a: pair?.[0] ?? "?", b: pair?.[1] ?? "?" };
    },
  },
];