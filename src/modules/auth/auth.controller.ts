import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { SignInDto } from './dto/signin.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SetupSuperAdminDto } from './dto/setup-super-admin.dto';
import { AuthResponseDto, MessageResponseDto } from './dto/auth-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

interface AuthenticatedUser {
  id: string;
  jti: string;
}

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new account' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiConflictResponse({ description: 'Email already in use' })
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive a JWT access token' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @Auth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiOkResponse({ type: UserResponseDto })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findOne(user.id);
  }

  @Patch('me')
  @Auth()
  @ApiOperation({ summary: 'Update own profile (name, email, password)' })
  @ApiOkResponse({ type: UserResponseDto })
  updateMe(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user.id, dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Auth()
  @ApiOperation({ summary: 'Logout and revoke the current token' })
  @ApiOkResponse({ type: MessageResponseDto })
  logout(@CurrentUser() user: AuthenticatedUser) {
    this.authService.logout(user.jti);
    return { message: 'Logged out successfully' };
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in (alias for login, accepts username or email)' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  signin(@Body() dto: SignInDto) {
    return this.authService.login({ email: dto.username, password: dto.password });
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  @Auth()
  @ApiOperation({ summary: 'Sign out (alias for logout)' })
  @ApiOkResponse({ type: MessageResponseDto })
  signout(@CurrentUser() user: AuthenticatedUser) {
    this.authService.logout(user.jti);
    return { message: 'Signed out successfully' };
  }

  @Post('setup')
  @ApiOperation({
    summary: 'Bootstrap the first super admin',
    description:
      'One-time endpoint to create the initial SUPER_ADMIN account. ' +
      'Requires the `setupSecret` field to match the `SETUP_SECRET` env var. ' +
      'Returns 409 if a super admin already exists.',
  })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid setup secret' })
  @ApiConflictResponse({ description: 'A super admin already exists' })
  setupSuperAdmin(@Body() dto: SetupSuperAdminDto) {
    const { setupSecret, ...createDto } = dto;
    return this.authService.setupSuperAdmin(
      createDto as CreateUserDto,
      setupSecret,
      this.configService.get<string>('setup.secret'),
    );
  }
}
