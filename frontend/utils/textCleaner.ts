export function cleanText(input: string): string {
  return input
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[`*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateText(input: string, maxLength = 800): string {
  const cleaned = cleanText(input);
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return `${cleaned.slice(0, maxLength - 3).trim()}...`;
}
