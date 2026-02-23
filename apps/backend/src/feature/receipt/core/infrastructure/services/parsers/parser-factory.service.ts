import { Injectable, Logger, Optional, Inject } from '@nestjs/common';
import {
  IReceiptParser,
  IReceiptParserService,
  ReceiptParsingContext,
  ReceiptParsingResult,
} from '../../../application/services/receipt-parser.service';
import { LlmReceiptParser } from './llm-receipt.parser';

@Injectable()
export class ReceiptParserFactory implements IReceiptParserService {
  private readonly logger = new Logger(ReceiptParserFactory.name);
  private readonly parsers: IReceiptParser[] = [];

  constructor(
    private readonly llmParser: LlmReceiptParser,
    @Optional()
    @Inject('OpencodeParser')
    private readonly opencodeParser?: IReceiptParser,
  ) {
    this.parsers = [];
    if (this.opencodeParser) this.parsers.push(this.opencodeParser);
    this.parsers.push(this.llmParser);

    this.logger.log(`Initialized parsers: ${this.parsers.map((p) => p.name).join(', ')}`);
  }

  async parse(
    text: string,
    context: ReceiptParsingContext,
  ): Promise<ReceiptParsingResult> {
    for (const parser of this.parsers) {
      try {
        this.logger.log(`[TIMING] Starting parser: ${parser.name}`);
        const parserStart = Date.now();
        const result = await parser.parse(text, context);
        this.logger.log(
          `[TIMING] Parser '${parser.name}' completed in ${Date.now() - parserStart}ms`,
        );
        return result;
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
}
