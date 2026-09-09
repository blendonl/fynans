import { Logger } from '@nestjs/common';
import { EmailMessage, EmailSender } from './email-sender.interface';

export class ConsoleEmailSender implements EmailSender {
  private readonly logger = new Logger(ConsoleEmailSender.name);

  send(message: EmailMessage): Promise<void> {
    this.logger.log(
      [
        'Email not delivered - console mode',
        `To:      ${message.to}`,
        `Subject: ${message.subject}`,
        message.text,
      ].join('\n'),
    );

    return Promise.resolve();
  }
}
