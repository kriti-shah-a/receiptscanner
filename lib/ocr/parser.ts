export type ParsedReceipt = { merchant: string; amount: string; date: string; cardLastFour: string };
const amountPattern = /(?:\$\s*)?(\d{1,6}(?:,\d{3})*\.\d{2})/g;
const datePatterns = [/\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{4}|\d{2})\b/, /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/];

function parseAmount(lines: string[]) {
  const labels = /\b(grand\s+total|total\s+due|amount\s+due|balance|total)\b/i;
  const found: { value: number; score: number; line: number }[] = [];
  lines.forEach((line, index) => {
    for (const match of line.matchAll(amountPattern)) {
      const value = Number(match[1].replace(/,/g, ""));
      if (value > 0 && value < 1_000_000) found.push({ value, score: labels.test(line) ? 10 : 0, line: index });
    }
  });
  found.sort((a, b) => b.score - a.score || b.line - a.line || b.value - a.value);
  return found[0]?.value.toFixed(2) ?? "";
}

function parseDate(lines: string[]) {
  for (const line of lines) for (let i = 0; i < datePatterns.length; i++) {
    const match = line.match(datePatterns[i]);
    if (!match) continue;
    const [year, month, day] = i === 1
      ? [Number(match[1]), Number(match[2]), Number(match[3])]
      : [Number(match[3]) < 100 ? 2000 + Number(match[3]) : Number(match[3]), Number(match[1]), Number(match[2])];
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  return new Date().toISOString().slice(0, 10);
}

function parseCard(text: string) {
  const explicit = text.match(/(?:visa|master\s?card|amex|discover|ending\s+in)[^\n\d]{0,18}(?:[*x#\s-]*)(\d{4})\b/i);
  return explicit?.[1] ?? text.match(/(?:\*{3,}|x{3,})\s*(\d{4})\b/i)?.[1] ?? "";
}

function parseMerchant(lines: string[]) {
  const excluded = /(?:receipt|invoice|thank|welcome|www\.|https?|tel|phone|\d{3}[-.)\s]\d{3}|\b(st|street|road|rd|ave|avenue|blvd|drive|dr)\b)/i;
  return lines.slice(0, 8).map((line) => line.trim()).find((line) => line.length >= 2 && line.length <= 48 && /[a-z]/i.test(line) && !excluded.test(line) && !/^\W*\d/.test(line)) ?? "";
}

export function parseReceiptText(text: string): ParsedReceipt {
  const lines = text.split(/\r?\n/).map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);
  return { merchant: parseMerchant(lines), amount: parseAmount(lines), date: parseDate(lines), cardLastFour: parseCard(text) };
}
