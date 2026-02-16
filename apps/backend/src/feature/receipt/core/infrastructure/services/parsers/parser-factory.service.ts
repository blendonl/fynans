import { Injectable, Logger, Optional } from '@nestjs/common';
import {
  IReceiptParser,
  IReceiptParserService,
  ReceiptParsingContext,
  ReceiptParsingResult,
} from '../../../application/services/receipt-parser.service';
import { LlmReceiptParser } from './llm-receipt.parser';
import { AlbanianReceiptParser } from './albanian-receipt.parser';
import { GenericReceiptParser } from './generic-receipt.parser';
import { VisionReceiptParser } from './vision-receipt.parser';

@Injectable()
export class ReceiptParserFactory implements IReceiptParserService {
  private readonly logger = new Logger(ReceiptParserFactory.name);
  private readonly parsers: IReceiptParser[] = [];

  constructor(
    private readonly llmParser: LlmReceiptParser,
    private readonly albanianParser: AlbanianReceiptParser,
    private readonly genericParser: GenericReceiptParser,
    @Optional() private readonly visionParser?: VisionReceiptParser,
  ) {
    this.parsers = [this.llmParser, this.albanianParser, this.genericParser];
    const parserNames = this.parsers.map((p) => p.name);
    if (this.visionParser) parserNames.unshift('vision-llm');
    this.logger.log(`Initialized parsers: ${parserNames.join(', ')}`);
  }

  async parse(
    text: string,
    context: ReceiptParsingContext,
  ): Promise<ReceiptParsingResult> {
    // Try vision parser first if image is available
    if (context.imageBuffer && this.visionParser) {
      try {
        this.logger.log('Using parser: vision-llm');
        const result = await this.visionParser.parseFromImage(
          context.imageBuffer,
          context,
        );

        // Cross-validate VLM results against OCR text
        if (text) {
          this.crossValidateWithOcr(result, text);
        }

        return result;
      } catch (error) {
        this.logger.warn(
          `Vision parser failed, falling back to text parsers: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    // Fallback to text-based parsers
    for (const parser of this.parsers) {
      if (!parser.canParse(text)) continue;

      try {
        this.logger.log(`Using parser: ${parser.name}`);
        return await parser.parse(text, context);
      } catch (error) {
        this.logger.warn(
          `Parser '${parser.name}' failed, trying next: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    throw new Error('No suitable parser found for receipt');
  }

  registerParser(parser: IReceiptParser): void {
    this.parsers.push(parser);
  }

  /**
   * Cross-validate VLM parsing results against numbers found in OCR text.
   * Logging-only — does not auto-correct.
   */
  private crossValidateWithOcr(
    result: ReceiptParsingResult,
    ocrText: string,
  ): void {
    const ocrNumbers = this.extractNumbers(ocrText);
    if (ocrNumbers.length === 0) return;

    // Check total amount
    if (result.totalAmount) {
      const totalFound = ocrNumbers.some(
        (n) => Math.abs(n - result.totalAmount!) < 0.02,
      );
      if (!totalFound) {
        this.logger.warn(
          `Cross-validation: VLM total ${result.totalAmount} not found in OCR numbers`,
        );
      }
    }

    // Check each item price
    let mismatchCount = 0;
    for (const item of result.items) {
      const priceFound = ocrNumbers.some(
        (n) => Math.abs(n - item.price) < 0.02,
      );
      if (!priceFound) {
        mismatchCount++;
      }
    }

    if (mismatchCount > 0) {
      this.logger.warn(
        `Cross-validation: ${mismatchCount}/${result.items.length} VLM item prices not found in OCR text`,
      );
    }
  }

  private extractNumbers(text: string): number[] {
    const matches = text.match(/\d+[.,]\d{1,2}/g) || [];
    return matches
      .map((m) => parseFloat(m.replace(',', '.')))
      .filter((n) => !isNaN(n) && n > 0);
  }
}
