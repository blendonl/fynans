import { Injectable, Logger } from '@nestjs/common';

interface RawParsedItem {
  name: string;
  price: number;
  quantity?: number;
  suggestedItemCategory?: string;
  matchedExistingItem?: string;
}

interface RawParsedReceipt {
  storeName?: string;
  storeLocation?: string;
  items?: RawParsedItem[];
  totalAmount?: number;
  date?: string;
  time?: string;
  suggestedExpenseCategory?: string;
}

export interface PostProcessedReceipt {
  storeName: string;
  storeLocation: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    suggestedItemCategory?: string;
    matchedExistingItem?: string;
  }>;
  totalAmount?: number;
  date?: string;
  time?: string;
  suggestedExpenseCategory?: string;
}

const JUNK_PATTERNS =
  /^(total[ei]?|sub\s*total|tax|tvsh|tush|ndryshim|cash|kesh|card|kart[eë]|visa|mastercard|discount|zbritje|bonus|faleminderit|thank|change|rest|paguar|pag\.|nr\.?\s*fis|nipt|fatur[eë]|fiscal|operator|ark[eë]|kasier|data|or[eë]|vendndodhja|adresa|tel\.?|bank|rruga|klient|atk|nr\s*serial|kopje|fisk|veprimi|menyra|pageses)$/i;

const JUNK_CONTAINS =
  /\b(subtotal|grand total|total amount|amount due|change due|balance|payment|paid|credit card|debit card)\b/i;

@Injectable()
export class ReceiptPostProcessor {
  private readonly logger = new Logger(ReceiptPostProcessor.name);

  process(raw: RawParsedReceipt): PostProcessedReceipt {
    let items = (raw.items || [])
      .map((item) => this.cleanItem(item))
      .filter((item): item is NonNullable<typeof item> => item !== null);

    items = this.deduplicateItems(items);

    const validatedTotal = this.crossCheckTotal(items, raw.totalAmount);

    const date = this.validateDate(raw.date);

    return {
      storeName: this.cleanStoreName(raw.storeName) || 'Unknown Store',
      storeLocation: (raw.storeLocation || '').trim(),
      items,
      totalAmount: this.validateTotal(validatedTotal),
      date,
      time: this.validateTime(raw.time),
      suggestedExpenseCategory: raw.suggestedExpenseCategory || undefined,
    };
  }

  private cleanItem(
    item: RawParsedItem,
  ): PostProcessedReceipt['items'][number] | null {
    if (!item.name || typeof item.name !== 'string') return null;

    let name = item.name.trim();

    // Remove leading/trailing numbers that aren't part of a weight/size
    name = name.replace(/^\d+\s+(?!\s*(kg|g|l|ml|cl)\b)/i, '');
    name = name.replace(/\s+\d+$/, '');
    name = name.trim();

    if (name.length <= 1) return null;
    if (/^\d+([.,]\d+)?$/.test(name)) return null;

    // Check junk patterns
    if (JUNK_PATTERNS.test(name.trim())) return null;
    if (JUNK_CONTAINS.test(name)) return null;

    // Validate price
    const price =
      typeof item.price === 'number'
        ? item.price
        : parseFloat(String(item.price));
    if (isNaN(price) || price <= 0 || price >= 10_000) return null;

    // Validate quantity — preserve fractional quantities for weight-based items (kg, g)
    let quantity = item.quantity ?? 1;
    if (typeof quantity !== 'number' || quantity <= 0) quantity = 1;
    const isWeightBased =
      quantity % 1 !== 0 &&
      /\b(kg|g|gr|gram)\b/i.test(name);
    if (!isWeightBased) {
      quantity = Math.round(quantity);
    } else {
      quantity = Math.round(quantity * 1000) / 1000;
    }

    // Capitalize properly: first letter uppercase
    name = name.charAt(0).toUpperCase() + name.slice(1);

    return {
      name,
      price,
      quantity,
      suggestedItemCategory: item.suggestedItemCategory || undefined,
      matchedExistingItem: item.matchedExistingItem || undefined,
    };
  }

  private deduplicateItems(
    items: PostProcessedReceipt['items'],
  ): PostProcessedReceipt['items'] {
    const seen = new Map<string, PostProcessedReceipt['items'][number]>();

    for (const item of items) {
      const key = `${item.name.toLowerCase()}|${item.price}`;
      const existing = seen.get(key);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        seen.set(key, { ...item });
      }
    }

    return Array.from(seen.values());
  }

  private crossCheckTotal(
    items: PostProcessedReceipt['items'],
    totalAmount?: number,
  ): number | undefined {
    if (!totalAmount || items.length === 0) return totalAmount;

    const itemsSum = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const roundedItemsSum = Math.round(itemsSum * 100) / 100;

    const difference = Math.abs(roundedItemsSum - totalAmount);
    const threshold = totalAmount * 0.1;

    if (difference > threshold) {
      this.logger.warn(
        `Items total (${roundedItemsSum.toFixed(2)}) differs from receipt total (${totalAmount}) by ${difference.toFixed(2)} (>${threshold.toFixed(2)} threshold)`,
      );

      // If items sum and receipt total differ by >50% and we have 3+ items, prefer items sum
      if (items.length >= 3 && difference > totalAmount * 0.5) {
        this.logger.warn(
          `Large discrepancy with ${items.length} items — using items sum (${roundedItemsSum}) instead of receipt total (${totalAmount})`,
        );
        return roundedItemsSum;
      }

      // Check if a single item accounts for the entire difference
      for (const item of items) {
        const itemTotal = item.price * item.quantity;
        if (Math.abs(itemTotal - difference) < 1) {
          this.logger.warn(
            `Item "${item.name}" (${itemTotal}) may be a misread — its total matches the discrepancy`,
          );
        }
      }
    }

    return totalAmount;
  }

  private cleanStoreName(name?: string): string {
    if (!name) return '';
    return name.trim().replace(/\s+/g, ' ');
  }

  private validateDate(date?: string | null): string | undefined {
    if (!date) return undefined;

    const match = date.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!match) return undefined;

    const [, day, month, year] = match;
    const parsed = new Date(`${year}-${month}-${day}`);
    if (isNaN(parsed.getTime())) return undefined;

    // Reject future dates
    if (parsed > new Date()) {
      this.logger.warn(`Receipt date ${date} is in the future, discarding`);
      return undefined;
    }

    return date;
  }

  private validateTime(time?: string | null): string | undefined {
    if (!time) return undefined;
    const match = time.match(/^(\d{2}):(\d{2})$/);
    if (!match) return undefined;
    const [, hours, minutes] = match;
    if (parseInt(hours) > 23 || parseInt(minutes) > 59) return undefined;
    return time;
  }

  private validateTotal(total?: number): number | undefined {
    if (total === null || total === undefined) return undefined;
    if (total <= 0 || total >= 50_000) return undefined;
    return total;
  }
}
