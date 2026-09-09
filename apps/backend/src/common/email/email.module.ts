import { Logger, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConsoleEmailSender } from './console-email.sender';
import { EMAIL_SENDER, EmailSender } from './email-sender.interface';

async function createEmailSender(config: ConfigService): Promise<EmailSender> {
  const logger = new Logger('EmailModule');
  const apiKey = config.get<string>('RESEND_API_KEY')?.trim();
  const from = config.get<string>('EMAIL_FROM')?.trim();

  if (!apiKey || !from) {
    logger.warn(
      'Email is in console mode: set RESEND_API_KEY and EMAIL_FROM to deliver mail. Password reset and verification links will be printed to this log instead of being sent.',
    );
    return new ConsoleEmailSender();
  }

  const { ResendEmailSender } = await import('./resend-email.sender');

  logger.log(`Email is delivered through Resend from ${from}`);
  return new ResendEmailSender(apiKey, from);
}

const emailSenderProvider: Provider = {
  provide: EMAIL_SENDER,
  useFactory: createEmailSender,
  inject: [ConfigService],
};

@Module({
  imports: [ConfigModule],
  providers: [emailSenderProvider],
  exports: [EMAIL_SENDER],
})
export class EmailModule {}
