import { Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { EmailMessage, EmailSender } from './email-sender.interface';

export class ResendEmailSender implements EmailSender {
  private readonly logger = new Logger(ResendEmailSender.name);
  private readonly client: Resend;

  constructor(
    apiKey: string,
    private readonly from: string,
  ) {
    this.client = new Resend(apiKey);
  }

  async send(message: EmailMessage): Promise<void> {
    const { error } = await this.client.emails.send({
      from: this.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });

    if (error) {
      this.logger.error(`Resend rejected a message: ${error.message}`);
      throw new Error(`Resend rejected a message: ${error.message}`);
    }
  }
}
