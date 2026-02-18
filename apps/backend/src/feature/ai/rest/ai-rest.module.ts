import { Module } from '@nestjs/common';
import { AiCoreModule } from '../core/ai-core.module';
import { AiController } from './controllers/ai.controller';

@Module({
  imports: [AiCoreModule],
  controllers: [AiController],
})
export class AiRestModule {}
