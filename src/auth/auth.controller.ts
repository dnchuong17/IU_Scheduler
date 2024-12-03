import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from '../modules/user/dto/user.dto';
import { RefreshJwtAuthGuard } from './guard/refresh-jwt-auth.guard';
import { TracingLoggerService } from '../logger/tracing-logger.service';
import { SigninDto } from '../modules/user/dto/signin.dto';

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
    try {
      this.logger.debug('receive request register');
      return this.authService.signup(userDto);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('login')
  signIn(@Body() signInDto: SigninDto) {
    try {
      this.logger.debug('receive request login');
      return this.authService.signIn(signInDto);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  refreshToken(@Request() req) {
    this.logger.debug('receive request refresh token');
    return this.authService.refreshToken(req.user);
  }
}
