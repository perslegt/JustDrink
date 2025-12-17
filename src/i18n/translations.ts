export const translations = {
  nl: {
    common: { back: "Terug" },
    home: {
      play: "Spelen",
      selectPlayers: "Spelers selecteren",
    },
    players: {
      title: "Spelers",
      addPlaceholder: "Naam toevoegen",
    },
    games: {
      moreComingSoon: "Meer komt binnenkort..."
    },
    sipit: {
      tapNext: "Tap voor volgende",
      needPlayers: "Voeg minimaal 2 spelers toe om SipIt te spelen."
    },
  },
  en: {
    common: { back: "Back" },
    home: {
      play: "Play",
      selectPlayers: "Select players",
    },
    players: {
      title: "Players",
      addPlaceholder: "Add name",
    },
    games: {
      moreComingSoon: "More games coming soon!",
    },
    sipit: {
      tapNext: "Tap for next",
      needPlayers: "Add at least 2 players to play SipIt."
    },
  },
} as const;

export type Language = keyof typeof translations;
