import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@ApiTags('Authentication')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new employee', description: 'Creates a new employee account under a specific organization using its invite code and provisions a wallet.' })
  @ApiResponse({ status: 201, description: 'Employee registered successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid data or organization code.' })
  @ApiResponse({ status: 409, description: 'Email or phone number is already registered.' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Employee / Administrator Login', description: 'Authenticates credentials and issues a JWT access and refresh token set.' })
  @ApiResponse({ status: 200, description: 'Successfully authenticated, returns tokens.' })
  @ApiResponse({ status: 401, description: 'Invalid login credentials or suspended account.' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate JWT session tokens', description: 'Exchanges a valid refresh token for a brand new access and refresh token set.' })
  @ApiResponse({ status: 200, description: 'Tokens rotated successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid or expired session.' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Invalidate session / Logout', description: 'Revokes the refresh token and blacklists the current access token in Redis.' })
  @ApiResponse({ status: 200, description: 'Successfully logged out.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  async logout(@CurrentUser() user: JwtPayload, @Req() req: any) {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.split(' ')[1] : '';
    return this.authService.logout(user.sub, token);
  }
}
