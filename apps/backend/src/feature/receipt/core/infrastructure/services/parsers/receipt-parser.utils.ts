import { Logger } from '@nestjs/common';

const logger = new Logger('ReceiptParserUtils');

export function parseDateTime(
  date?: string | null,
  time?: string | null,
): Date | undefined {
  if (!date) return undefined;

  const dateMatch = date.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!dateMatch) return undefined;

  const [, day, month, year] = dateMatch;
  let isoString = `${year}-${month}-${day}`;

  if (time) {
    const timeMatch = time.match(/(\d{2}):(\d{2})/);
    if (timeMatch) {
      isoString += `T${timeMatch[1]}:${timeMatch[2]}:00`;
    }
  }

  const parsed = new Date(isoString);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

export function extractJson(
  response: string,
  options?: { repair?: boolean },
): Record<string, unknown> {
  try {
    return JSON.parse(response) as Record<string, unknown>;
  } catch {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in LLM response');

    try {
      return JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    } catch {
      if (options?.repair) {
        return repairTruncatedJson(jsonMatch[0]);
      }
      throw new Error('Failed to parse extracted JSON');
    }
  }
}

export function repairTruncatedJson(json: string): Record<string, unknown> {
  let repaired = json;

  // Remove trailing partial values (e.g., truncated strings or numbers)
  repaired = repaired.replace(/,\s*"[^"]*$/, '');
  repaired = repaired.replace(/,\s*\{[^}]*$/, '');
  repaired = repaired.replace(/,\s*$/, '');

  // Count and close unclosed brackets
  const opens = { '{': 0, '[': 0 };
  let inString = false;
  let escape = false;

  for (const ch of repaired) {
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === '{') opens['{']++;
    else if (ch === '}') opens['{']--;
    else if (ch === '[') opens['[']++;
    else if (ch === ']') opens['[']--;
  }

  for (let i = 0; i < opens['[']; i++) repaired += ']';
  for (let i = 0; i < opens['{']; i++) repaired += '}';

  logger.warn('Repaired truncated JSON from LLM response');
  return JSON.parse(repaired) as Record<string, unknown>;
}
