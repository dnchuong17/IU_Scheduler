import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from '../modules/user/user.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { RefreshJwtAuthGuard } from './guard/refresh-jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async signup(@Body() userDto: UserDto) {
    return await this.authService.signup(userDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  signIn(@Request() req) {
    return this.authService.signIn(req.user);
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  refreshToken(@Request() req) {
    return this.authService.refreshToken(req.user);
  }
}
