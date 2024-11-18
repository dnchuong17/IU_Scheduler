import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from '../modules/user/user.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { RefreshJwtAuthGuard } from './guard/refresh-jwt-auth.guard';
import { TracingLoggerService } from '../logger/tracing-logger.service';
import { SigninDto } from '../modules/user/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: TracingLoggerService,
  ) {
    logger.setContext(AuthController.name);
  }

  @Post('register')
  async signup(@Body() userDto: UserDto) {
    this.logger.debug('receive request register');
    return await this.authService.signup(userDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  signIn(@Body() signInDto: SigninDto) {
    this.logger.debug('receive request login');
    return this.authService.signIn(signInDto);
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  refreshToken(@Request() req) {
    this.logger.debug('receive request refresh token');
    return this.authService.refreshToken(req.user);
  }
}
