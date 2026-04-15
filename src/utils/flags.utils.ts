export function getFlagEmoji(countryCode: string): string {
  const code = countryCode.toUpperCase();
  if (code.length !== 2) return '';
  return String.fromCodePoint(...[...code].map((c) => c.charCodeAt(0) + 127397));
}
