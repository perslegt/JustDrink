/**
 * Replaces placeholders like {a}, {b}, {c} with unique player names.
 * - Same placeholder letter = same player within one prompt
 * - Different letters = different players (if available)
 */
export function fillPlaceholders(
  text: string,
  players: string[]
): string {
  if (!players.length) return text;

  // Shuffle players once per prompt
  const shuffled = [...players].sort(() => Math.random() - 0.5);

  const map: Record<string, string> = {};
  let index = 0;

  return text.replace(/\{([a-z])\}/gi, (_, key: string) => {
    if (!map[key]) {
      map[key] = shuffled[index % shuffled.length];
      index++;
    }
    return map[key];
  });
}