/**
 * AiCategoryService is used for ad-hoc category suggestions via the AI endpoints.
 * It is NOT part of the receipt scanning pipeline — receipt categories are generated
 * inline by the receipt parsing prompt (see receipt-prompt.builder.ts).
 */
import { Injectable, Inject, Logger } from '@nestjs/common';
import { ILlmService } from '~feature/receipt/core/application/interfaces/llm.interface';
import { ExpenseCategoryService } from '~feature/expense-category/core/application/services/expense-category.service';
import { StoreItemCategoryService } from '~feature/store-item-category/core/application/services/store-item-category.service';
import { IncomeCategoryService } from '~feature/income-category/core/application/services/income-category.service';
import { CreateExpenseCategoryDto } from '~feature/expense-category/core/application/dto/create-expense-category.dto';
import { CreateStoreItemCategoryDto } from '~feature/store-item-category/core/application/dto/create-store-item-category.dto';
import { CreateIncomeCategoryDto } from '~feature/income-category/core/application/dto/create-income-category.dto';
import { CategorySuggestion } from '../../domain/interfaces/category-suggestion.interface';

@Injectable()
export class AiCategoryService {
  private readonly logger = new Logger(AiCategoryService.name);

  constructor(
    @Inject('LlmService')
    private readonly llmService: ILlmService,
    private readonly expenseCategoryService: ExpenseCategoryService,
    private readonly storeItemCategoryService: StoreItemCategoryService,
    private readonly incomeCategoryService: IncomeCategoryService,
  ) {}

  async suggestItemCategory(
    userId: string,
    itemName: string,
  ): Promise<CategorySuggestion | null> {
    const cleaned = this.cleanItemName(itemName);
    const name = await this.askCategoryName(
      `You are a category classifier for grocery/shopping items.\nThe item name may be in Albanian or English. If it is Albanian, first translate it to English, then decide the category.\n\nItem: "${cleaned}"`,
    );
    if (!name) return null;
    return this.findOrCreateItemCategory(userId, name);
  }

  async suggestExpenseCategory(
    userId: string,
    itemNames: string[],
  ): Promise<CategorySuggestion | null> {
    const cleaned = itemNames.map((n) => this.cleanItemName(n));
    const name = await this.askCategoryName(
      `You are a category classifier for expenses.\nThe item names may be in Albanian or English. If they are Albanian, first translate them to English, then decide the category.\n\nItems: ${cleaned.join(', ')}`,
    );
    if (!name) return null;
    return this.findOrCreateExpenseCategory(userId, name);
  }

  async suggestIncomeCategory(
    userId: string,
    note: string,
  ): Promise<CategorySuggestion | null> {
    const name = await this.askCategoryName(
      `You are a category classifier for income.\nThe description may be in Albanian or English. If it is Albanian, first translate it to English, then decide the category.\n\nDescription: "${note}"`,
    );
    if (!name) return null;
    return this.findOrCreateIncomeCategory(userId, name);
  }

  /**
   * Strip trailing price-like numbers from item names.
   * e.g. "Kese sherbimi 0.05" → "Kese sherbimi"
   */
  private cleanItemName(name: string): string {
    return name.replace(/\s+\d+([.,]\d+)?\s*$/, '').trim();
  }

  private async askCategoryName(context: string): Promise<string | null> {
    try {
      const prompt = `${context}\n\nRespond ONLY with valid JSON: {"translation": "<English translation if not English, otherwise repeat the name>", "category": "<category name>"}\nThe category must be in English, short (1-3 words), and describe the product type.\nAlways provide a category. Use common grocery/shopping categories like: Dairy, Meat, Bread, Beverages, Snacks, Cleaning, Bags, Fruits, Vegetables, Household, etc.\nDo not include any text outside the JSON object.`;
      const response = await this.llmService.generateCompletion(prompt, {
        format: 'json',
        temperature: 0,
        maxTokens: 200,
      });
      const parsed = this.parseJsonResponse(response.response) as {
        translation?: string;
        category?: string | null;
      };
      return parsed.category?.trim() || null;
    } catch (error) {
      this.logger.warn(`Category suggestion failed: ${error}`);
      return null;
    }
  }

  private parseJsonResponse(raw: string): Record<string, unknown> {
    // Try direct parse first
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      // continue to extraction attempts
    }

    // Extract JSON object from surrounding text/markdown fences
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const cleaned = jsonMatch[0]
        .replace(/,\s*([}\]])/g, '$1') // remove trailing commas
        .replace(/[\x00-\x1f]/g, ' '); // replace control chars with spaces
      try {
        return JSON.parse(cleaned) as Record<string, unknown>;
      } catch {
        // Try truncated JSON repair: close open strings and braces
        const repaired = this.repairTruncatedJson(cleaned);
        return JSON.parse(repaired) as Record<string, unknown>;
      }
    }

    throw new SyntaxError(`No JSON object found in response: ${raw.slice(0, 200)}`);
  }

  private repairTruncatedJson(json: string): string {
    let repaired = json;

    // Count unmatched quotes — if odd, the string was truncated mid-value
    const quoteCount = (repaired.match(/(?<!\\)"/g) || []).length;
    if (quoteCount % 2 !== 0) {
      repaired += '"';
    }

    // Close any unclosed braces/brackets
    const open = (repaired.match(/\{/g) || []).length;
    const close = (repaired.match(/\}/g) || []).length;
    for (let i = 0; i < open - close; i++) {
      repaired += '}';
    }

    return repaired;
  }

  private async findOrCreateExpenseCategory(
    userId: string,
    name: string,
  ): Promise<CategorySuggestion> {
    const cat = await this.expenseCategoryService.create(
      new CreateExpenseCategoryDto(name, false),
      userId,
    );
    return { categoryId: cat.id, categoryName: cat.name };
  }

  private async findOrCreateItemCategory(
    userId: string,
    name: string,
  ): Promise<CategorySuggestion> {
    const cat = await this.storeItemCategoryService.create(
      new CreateStoreItemCategoryDto(name),
      userId,
    );
    return { categoryId: cat.id, categoryName: cat.name };
  }

  private async findOrCreateIncomeCategory(
    userId: string,
    name: string,
  ): Promise<CategorySuggestion> {
    const cat = await this.incomeCategoryService.create(
      new CreateIncomeCategoryDto(name),
      userId,
    );
    return { categoryId: cat.id, categoryName: cat.name };
  }
}
