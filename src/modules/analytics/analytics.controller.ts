import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../users/entities/user.entity';

@ApiTags('Analytics')
@Auth(Role.ADMIN, Role.SUPER_ADMIN)
@Controller({ path: 'analytics', version: '1' })
export class AnalyticsController {
  constructor(private readonly svc: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get analytics summary (admin)' })
  @ApiOkResponse({
    description: 'Analytics summary with page views and contact message stats',
  })
  getSummary() {
    return this.svc.getSummary();
  }
}
