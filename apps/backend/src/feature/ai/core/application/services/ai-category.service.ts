import { Injectable, Inject, Logger } from '@nestjs/common';
import { IOllamaService } from '~feature/receipt/core/application/interfaces/ollama.interface';
import { ExpenseCategoryService } from '~feature/expense-category/core/application/services/expense-category.service';
import { StoreItemCategoryService } from '~feature/store-item-category/core/application/services/store-item-category.service';
import { IncomeCategoryService } from '~feature/income-category/core/application/services/income-category.service';
import { CreateExpenseCategoryDto } from '~feature/expense-category/core/application/dto/create-expense-category.dto';
import { CreateStoreItemCategoryDto } from '~feature/store-item-category/core/application/dto/create-store-item-category.dto';
import { CreateIncomeCategoryDto } from '~feature/income-category/core/application/dto/create-income-category.dto';

export interface CategorySuggestion {
  categoryId: string;
  categoryName: string;
}

@Injectable()
export class AiCategoryService {
  private readonly logger = new Logger(AiCategoryService.name);

  constructor(
    @Inject('OllamaService')
    private readonly ollamaService: IOllamaService,
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
      const prompt = `${context}\n\nRespond with JSON: {"translation": "<English translation if not English, otherwise repeat the name>", "category": "<category name>"}\nThe category must be in English, short (1-3 words), and describe the product type.\nAlways provide a category. Use common grocery/shopping categories like: Dairy, Meat, Bread, Beverages, Snacks, Cleaning, Bags, Fruits, Vegetables, Household, etc.`;
      const response = await this.ollamaService.generateCompletion(prompt, {
        format: 'json',
        temperature: 0,
        maxTokens: 100,
      });
      const parsed = JSON.parse(response.response) as {
        translation?: string;
        category?: string | null;
      };
      return parsed.category?.trim() || null;
    } catch (error) {
      this.logger.warn(`Category suggestion failed: ${error}`);
      return null;
    }
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
