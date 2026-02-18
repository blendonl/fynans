import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OllamaHttpService } from './infrastructure/services/ollama-http.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'OllamaService',
      useClass: OllamaHttpService,
    },
  ],
  exports: ['OllamaService'],
})
export class OllamaModule {}
