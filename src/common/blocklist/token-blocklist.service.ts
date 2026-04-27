import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenBlocklistService {
  private readonly blocklist = new Set<string>();

  add(jti: string): void {
    this.blocklist.add(jti);
  }

  has(jti: string): boolean {
    return this.blocklist.has(jti);
  }
}
