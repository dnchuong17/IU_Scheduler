import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../modules/user/service/user.service';
import { UserDto } from '../modules/user/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../modules/user/entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SigninDto } from '../modules/user/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { TracingLoggerService } from '../logger/tracing-logger.service';
import { EmailValidationHelper } from '../modules/validation/service/email-validation.helper';
import { RedisHelper } from '../modules/redis/service/redis.service';
import { KEY } from '../common/user.constant';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly logger: TracingLoggerService,
    private readonly emailValidationHelper: EmailValidationHelper,
    private readonly redisHelper: RedisHelper,
  ) {
    logger.setContext(AuthService.name);
  }

  async signup(userDto: UserDto) {
    this.logger.debug('sign up');
    const existedUser = await this.userService.findAccountWithEmail(
      userDto.email,
    );
    if (existedUser) {
      throw new BadRequestException('Email already in use');
    }
    const checkEmailResult = await this.emailValidationHelper.validateEmail(
      userDto.email,
    );
    if (!checkEmailResult) {
      this.logger.debug('Email is not real and fail to validate email');
      throw new BadRequestException('Email is not real email');
    }
    try {
      const hashPassword = await bcrypt.hash(userDto.password, 10);
      const newUser = plainToInstance(UserEntity, {
        ...userDto,
        password: hashPassword,
      });
      await this.userRepository.save(newUser);
      return 'sign up successfully';
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async validateUser(username: string, password: string) {
    const user = await this.userService.findAccountWithEmail(username);
    try {
      if (user && (await bcrypt.compare(password, user.password))) {
        const { password, ...result } = user;
        return result;
      }
    } catch (error) {
      throw new UnauthorizedException(error);
    }
    return null;
  }

  async signIn(signIn: SigninDto) {
    const isSignIn = await this.validateUser(signIn.username, signIn.password);
    if (isSignIn) {
      const user = await this.userService.findAccountWithEmail(signIn.username);
      const payload = {
        username: signIn.username,
        sub: {
          name: user.name,
          sid: user.studentID,
        },
      };

      const accessToken = this.jwtService.sign(payload);
      const refreshToken = await this.refreshToken(signIn);

      if (refreshToken) {
        await this.redisHelper.set(KEY, refreshToken.refreshToken);
      }

      return {
        accessToken,
        refreshToken: refreshToken.refreshToken,
      };
    } else {
      throw new UnauthorizedException('Invalid username or password');
    }
  }

  async refreshToken(signIn: SigninDto) {
    const isSignIn = await this.validateUser(signIn.username, signIn.password);

    if (isSignIn) {
      const user = await this.userService.findAccountWithEmail(signIn.username);
      const payload = {
        username: signIn.username,
        sub: {
          name: user.name,
          studentId: user.studentID,
        },
      };

      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
      return {
        refreshToken,
      };
    }
  }

  async extractUIDFromToken() {
    const token = await this.redisHelper.get(KEY);
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      const decoded = await this.jwtService.decode(token);
      return decoded.sub?.studentId;
    } catch (error) {
      this.logger.error('Failed to verify token');
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
