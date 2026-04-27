import { Global, Module } from '@nestjs/common';
import { TokenBlocklistService } from './token-blocklist.service';

@Global()
@Module({
  providers: [TokenBlocklistService],
  exports: [TokenBlocklistService],
})
export class TokenBlocklistModule {}
