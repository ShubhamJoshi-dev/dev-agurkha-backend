import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../users/entities/user.entity';

@ApiTags('Settings')
@Controller({ path: 'settings', version: '1' })
export class SettingsController {
  constructor(private readonly svc: SettingsService) {}

  @Get('general')
  @ApiOperation({ summary: 'Get general settings (public)' })
  @ApiOkResponse({ description: 'General settings object' })
  getGeneral() {
    return this.svc.get('general');
  }

  @Get('homepage')
  @ApiOperation({ summary: 'Get homepage settings (public)' })
  @ApiOkResponse({ description: 'Homepage settings object' })
  getHomepage() {
    return this.svc.get('homepage');
  }

  @Get('site')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get site settings (admin)' })
  @ApiOkResponse({ description: 'Site settings object' })
  getSite() {
    return this.svc.get('site');
  }

  @Get('scripts')
  @ApiOperation({ summary: 'Get script injection settings (public)' })
  @ApiOkResponse({ description: 'Scripts settings object' })
  getScripts() {
    // Public: drives analytics + custom head/body script injection on the
    // public site. PATCH stays admin-protected.
    return this.svc.get('scripts');
  }

  @Get('social')
  @ApiOperation({ summary: 'Get social link settings (public)' })
  @ApiOkResponse({ description: 'Social settings object' })
  getSocial() {
    // Public: social links are shown in the public site footer. Only the PATCH
    // (update) stays admin-protected.
    return this.svc.get('social');
  }

  @Patch('general')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update general settings (admin)' })
  updateGeneral(@Body() body: Record<string, unknown>) {
    return this.svc.upsert('general', body);
  }

  @Patch('site')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update site settings (admin)' })
  updateSite(@Body() body: Record<string, unknown>) {
    return this.svc.upsert('site', body);
  }

  @Patch('scripts')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update script settings (admin)' })
  updateScripts(@Body() body: Record<string, unknown>) {
    return this.svc.upsert('scripts', body);
  }

  @Patch('social')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update social settings (admin)' })
  updateSocial(@Body() body: Record<string, unknown>) {
    return this.svc.upsert('social', body);
  }

  @Patch('homepage')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update homepage settings (admin)' })
  updateHomepage(@Body() body: Record<string, unknown>) {
    return this.svc.upsert('homepage', body);
  }
}
