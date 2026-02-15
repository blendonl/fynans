import { Injectable } from '@nestjs/common';
import {
  IItemsParser,
  ReceiptItem,
} from '../../interfaces/items-parser.interface';

@Injectable()
export class GenericItemsParser implements IItemsParser {
  private readonly PRICE_PATTERN = /(\d+[.,]\d{1,2})\s*[€$£]?$/;
  private readonly QUANTITY_PATTERN = /^(\d+)\s*x\s+(.+)/i;

  extractItems(lines: string[]): ReceiptItem[] {
    const items: ReceiptItem[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const qtyMatch = line.match(this.QUANTITY_PATTERN);
      if (qtyMatch) {
        const quantity = parseInt(qtyMatch[1], 10);
        const restOfLine = qtyMatch[2];
        const priceMatch = restOfLine.match(this.PRICE_PATTERN);

        if (priceMatch) {
          const price = this.normalizePrice(priceMatch[1]);
          const name = restOfLine.replace(this.PRICE_PATTERN, '').trim();
          items.push({ name, price, quantity, unitPrice: price / quantity });
          continue;
        }
      }

      const priceMatch = line.match(this.PRICE_PATTERN);
      if (priceMatch) {
        const price = this.normalizePrice(priceMatch[1]);
        const name = line.replace(this.PRICE_PATTERN, '').trim();

        if (
          name.length > 2 &&
          !this.isLikelyNotItem(name) &&
          price > 0 &&
          price < 10000
        ) {
          items.push({ name, price, quantity: 1, unitPrice: price });
        }
      }
    }

    return items;
  }

  private normalizePrice(priceStr: string): number {
    const cleaned = priceStr.replace(/[€$£\s]/g, '').replace(',', '.');
    return parseFloat(cleaned);
  }

  private isLikelyNotItem(text: string): boolean {
    const excludePatterns = [
      /^(total|sum|subtotal|tax|vat|change|cash|card)/i,
      /^(date|time|receipt|invoice)/i,
      /^(thank you|welcome|visit)/i,
    ];

    return excludePatterns.some((pattern) => pattern.test(text));
  }
}
