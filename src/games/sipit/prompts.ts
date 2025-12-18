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

export const CATEGORY_WEIGHT: Record<Category, number> = {
  normal: 8,
  duo: 4,
  challenge: 2,
  vote: 2,
  chain: 1,
  rule_on: 1,
  rule_off: 0,      // wordt via effect getoond
  buddies_on: 0,    // via effect
  buddies_off: 0,   // via effect
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
      nl: "{a} vertelt iets gênants. Wil je niet? Neem 2 slokken.",
      en: "{a} shares something embarrassing. Don’t want to? Take 2 sips.",
    },
    fill: ({ pick }) => ({ a: pick(1)[0] ?? "?" }),
  },
  {
    category: "normal",
    text: {
      nl: "{a} mag iemand een bijnaam geven. Diegene drinkt 1 slok.",
      en: "{a} gives someone a nickname. They drink 1 sip.",
    },
    fill: ({ pick }) => ({ a: pick(1)[0] ?? "?" }),
  },
  {
    category: "normal",
    text: {
      nl: "Iedereen met een drankje in de hand: 1 slok.",
      en: "Everyone holding a drink: 1 sip.",
    },
  },
  {
    category: "normal",
    text: {
      nl: "Iedereen die vandaag al ‘morgen begin ik’ heeft gedacht: 2 slokken.",
      en: "Anyone who thought “I’ll start tomorrow” today: 2 sips.",
    },
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
      nl: "Degene met de hoogste batterij: deelt 2 slokken uit.",
      en: "Highest phone battery gives out 2 sips.",
    },
  },
  {
    category: "normal",
    text: {
      nl: "Iedereen met witte schoenen: 1 slok.",
      en: "Anyone wearing white shoes: 1 sip.",
    },
  },
  {
    category: "normal",
    text: {
      nl: "Iedereen die ooit een boete kreeg: 2 slokken.",
      en: "Anyone who ever got a fine: 2 sips.",
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
  {
    category: "normal",
    text: {
      nl: "{a} neemt 1 slok voor elke keer dat je vandaag hebt gegeten (max 3).",
      en: "{a} takes 1 sip for every time you ate today (max 3).",
    },
    fill: ({ pick }) => ({ a: pick(1)[0] ?? "?" }),
  },

  // =========================
  // DUO (veel)
  // =========================
  {
    category: "duo",
    text: { nl: "{a} en {b}: cheers! Neem samen 1 slok.", en: "{a} and {b}: cheers! Take 1 sip together." },
    fill: ({ pick }) => {
      const [a, b] = pick(2);
      return { a: a ?? "?", b: b ?? "?" };
    },
  },
  {
    category: "duo",
    text: { nl: "{a} en {b}: steen-papier-schaar. Verliezer 2 slokken.", en: "{a} and {b}: rock-paper-scissors. Loser takes 2 sips." },
    fill: ({ pick }) => {
      const [a, b] = pick(2);
      return { a: a ?? "?", b: b ?? "?" };
    },
  },
  {
    category: "duo",
    text: { nl: "{a} noemt een categorie. {b} moet 3 dingen noemen. Fout = 2 slokken.", en: "{a} picks a category. {b} names 3 things. Fail = 2 sips." },
    fill: ({ pick }) => {
      const [a, b] = pick(2);
      return { a: a ?? "?", b: b ?? "?" };
    },
  },
  {
    category: "duo",
    text: { nl: "{a} en {b} wisselen van drankje voor 1 slok.", en: "{a} and {b} swap drinks for 1 sip." },
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
    text: { nl: "{a}: doe 10 squats, anders 2 slokken.", en: "{a}: do 10 squats or take 2 sips." },
    fill: ({ pick }) => ({ a: pick(1)[0] ?? "?" }),
  },
  {
    category: "challenge",
    text: { nl: "{a}: 15 seconden plank. Faal = 2 slokken.", en: "{a}: 15 seconds plank. Fail = 2 sips." },
    fill: ({ pick }) => ({ a: pick(1)[0] ?? "?" }),
  },
  {
    category: "challenge",
    text: { nl: "{a}: raak je tenen (zonder knieën te buigen). Lukt niet? 2 slokken.", en: "{a}: touch your toes (no bent knees). Fail? 2 sips." },
    fill: ({ pick }) => ({ a: pick(1)[0] ?? "?" }),
  },
  {
    category: "challenge",
    text: { nl: "{a}: doe 10 push-ups. Niet? 3 slokken.", en: "{a}: do 10 push-ups. If not: 3 sips." },
    fill: ({ pick }) => ({ a: pick(1)[0] ?? "?" }),
  },
  {
    category: "challenge",
    text: { nl: "{a}: zeg het alfabet achterstevoren tot en met T. Fout = 2 slokken.", en: "{a}: say the alphabet backwards until T. Fail = 2 sips." },
    fill: ({ pick }) => ({ a: pick(1)[0] ?? "?" }),
  },

  // =========================
  // VOTE (veel)
  // =========================
  {
    category: "vote",
    text: { nl: "STEM: Wie is het meest likely om te laat te komen? Verliezer drinkt 2 slokken.", en: "VOTE: Who is most likely to be late? Loser drinks 2 sips." },
  },
  {
    category: "vote",
    text: { nl: "STEM: Wie zou het langst overleven in een zombie-apocalyps? Verliezer 2 slokken.", en: "VOTE: Who would survive longest in a zombie apocalypse? Loser 2 sips." },
  },
  {
    category: "vote",
    text: { nl: "STEM: Wie zou als eerste trouwen? Verliezer 2 slokken.", en: "VOTE: Who will get married first? Loser 2 sips." },
  },
  {
    category: "vote",
    text: { nl: "STEM: Wie is het meest likely om dronken te appen? Verliezer 2 slokken.", en: "VOTE: Who is most likely to drunk-text? Loser 2 sips." },
  },
  {
    category: "vote",
    text: { nl: "STEM: Wie kan het slechtst liegen? Verliezer 2 slokken.", en: "VOTE: Who is the worst liar? Loser 2 sips." },
  },

  // =========================
  // CHAIN (veel)
  // =========================
  {
    category: "chain",
    text: { nl: "KETTING: Om de beurt noem je een biermerk. Wie faalt: 2 slokken.", en: "CHAIN: Take turns naming a beer brand. First to fail: 2 sips." },
  },
  {
    category: "chain",
    text: { nl: "KETTING: Om de beurt noem je een land. Geen herhaling. Faal: 2 slokken.", en: "CHAIN: Take turns naming a country. No repeats. Fail: 2 sips." },
  },
  {
    category: "chain",
    text: { nl: "KETTING: Om de beurt noem je een artiest/DJ. Faal: 2 slokken.", en: "CHAIN: Take turns naming an artist/DJ. Fail: 2 sips." },
  },
  {
    category: "chain",
    text: { nl: "KETTING: Om de beurt noem je een film. Faal: 2 slokken.", en: "CHAIN: Take turns naming a movie. Fail: 2 sips." },
  },
  {
    category: "chain",
    text: { nl: "KETTING: Om de beurt noem je een sport. Faal: 2 slokken.", en: "CHAIN: Take turns naming a sport. Fail: 2 sips." },
  },

  // =========================
  // RULES (timed no-names via effect)
  // + losse “regel” prompts (wie faalt drinkt)
  // =========================
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
  {
    category: "rule_on",
    text: { nl: "REGEL: Niet wijzen. Wie wijst: 1 slok.", en: "RULE: No pointing. If you point: 1 sip." },
  },
  {
    category: "rule_on",
    text: { nl: "REGEL: Drink met links. Vergeet je dat: 1 slok.", en: "RULE: Drink with your left hand. Forget? 1 sip." },
  },
  {
    category: "rule_on",
    text: { nl: "REGEL: Niet lachen. Lach je: 2 slokken.", en: "RULE: No laughing. If you laugh: 2 sips." },
  },
  {
    category: "rule_on",
    text: { nl: "REGEL: Geen scheldwoorden. Overtreding: 2 slokken.", en: "RULE: No swearing. Break it: 2 sips." },
  },
  {
    category: "rule_on",
    text: { nl: "REGEL: Geen telefoons. Pak je ‘m? 2 slokken.", en: "RULE: No phones. Touch it? 2 sips." },
  },

  // =========================
  // BUDDIES (timed; engine zorgt voor pair + off met pair)
  // =========================
  {
    category: "buddies_on",
    effect: "buddies_on",
    text: { nl: "DRINKMAATJES: {a} & {b} zijn drinkmaatjes!", en: "DRINK BUDDIES: {a} & {b} are drink buddies!" },
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

  // =========================
  // BUDDY-RELATED NORMAL/DUO (alleen leuk als buddies actief is)
  // (engine kan deze gewoon kiezen; als buddiesPair null is valt hij terug op "?")
  // =========================
  {
    category: "normal",
    text: {
      nl: "Als jouw drinkmaatje een slok neemt, neem jij ook 1 slok mee (tot het wordt opgeheven).",
      en: "If your drink buddy takes a sip, you take 1 sip too (until it ends).",
    },
  },
  {
    category: "duo",
    text: {
      nl: "Drinkmaatjes-check: {a} & {b} nemen NU samen 1 slok.",
      en: "Buddy check: {a} & {b} take 1 sip together NOW.",
    },
    fill: ({ buddiesPair, pick }) => {
      const pair = buddiesPair ?? (pick(2) as any);
      return { a: pair?.[0] ?? "?", b: pair?.[1] ?? "?" };
    },
  },
];