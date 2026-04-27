import {
  Controller,
  Post,
  Get,
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
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
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

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Auth()
  @ApiOperation({ summary: 'Logout and revoke the current token' })
  @ApiOkResponse({ type: MessageResponseDto })
  logout(@CurrentUser() user: AuthenticatedUser) {
    this.authService.logout(user.jti);
    return { message: 'Logged out successfully' };
  }
}
