import { Injectable, Logger } from '@nestjs/common';
import {
  IReceiptParser,
  IReceiptParserService,
  ReceiptParsingContext,
  ReceiptParsingResult,
} from '../../../application/services/receipt-parser.service';
import { LlmReceiptParser } from './llm-receipt.parser';
import { AlbanianReceiptParser } from './albanian-receipt.parser';
import { GenericReceiptParser } from './generic-receipt.parser';

@Injectable()
export class ReceiptParserFactory implements IReceiptParserService {
  private readonly logger = new Logger(ReceiptParserFactory.name);
  private readonly parsers: IReceiptParser[] = [];

  constructor(
    private readonly llmParser: LlmReceiptParser,
    private readonly albanianParser: AlbanianReceiptParser,
    private readonly genericParser: GenericReceiptParser,
  ) {
    this.parsers = [this.llmParser, this.albanianParser, this.genericParser];
    this.logger.log(
      `Initialized ${this.parsers.length} parsers: ${this.parsers.map((p) => p.name).join(', ')}`,
    );
  }

  async parse(
    text: string,
    context: ReceiptParsingContext,
  ): Promise<ReceiptParsingResult> {
    for (const parser of this.parsers) {
      if (!parser.canParse(text)) continue;

      try {
        this.logger.log(`Using parser: ${parser.name}`);
        return await parser.parse(text, context);
      } catch (error) {
        this.logger.warn(
          `Parser '${parser.name}' failed, trying next: ${error instanceof Error ? error.message : error}`,
        );
      }
    }

    throw new Error('No suitable parser found for receipt');
  }

  registerParser(parser: IReceiptParser): void {
    this.parsers.push(parser);
  }
}
