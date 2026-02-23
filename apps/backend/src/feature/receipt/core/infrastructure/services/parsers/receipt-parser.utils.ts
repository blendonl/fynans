import { Logger } from '@nestjs/common';
import { LlmJsonReceipt, ParsedReceipt } from './parser.interfaces';

const logger = new Logger('ReceiptParserUtils');

/**
 * Converts the JSON structure returned by the LLM into the internal ParsedReceipt format
 * consumed by ReceiptPostProcessor.
 */
export function llmJsonToParsedReceipt(json: LlmJsonReceipt): ParsedReceipt {
  const items = (json.items ?? [])
    .filter((item) => item.name && typeof item.name === 'string')
    .map((item) => ({
      name: item.name!.trim(),
      price:
        typeof item.price === 'number'
          ? item.price
          : parseFloat(String(item.price)),
      quantity:
        typeof item.quantity === 'number' && item.quantity > 0
          ? item.quantity
          : 1,
      suggestedItemCategory: item.category || undefined,
      size:
        item.size?.value && item.size?.unit
          ? {
              value:
                typeof item.size.value === 'number'
                  ? item.size.value
                  : parseFloat(String(item.size.value)),
              unit: item.size.unit.toLowerCase(),
            }
          : undefined,
    }))
    .filter((item) => !isNaN(item.price) && item.price > 0);

  return {
    storeName: (json.storeName || 'Unknown').trim(),
    storeLocation: (json.storeLocation || '').trim(),
    items,
    totalAmount:
      json.total !== null && json.total !== undefined ? json.total : undefined,
    date: json.date || undefined,
    time: json.time || undefined,
    suggestedExpenseCategory: json.expenseCategory || undefined,
  };
}

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
