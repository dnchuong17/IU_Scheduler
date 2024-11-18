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
import { ScheduleTemplateService } from '../modules/schedulerTemplate/scheduleTemplate.service';
import { plainToInstance } from 'class-transformer';
import { TracingLoggerService } from '../logger/tracing-logger.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly templateService: ScheduleTemplateService,
    private readonly logger: TracingLoggerService,
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
    try {
      const hashPassword = await bcrypt.hash(userDto.password, 10);
      const newUser = await plainToInstance(UserEntity, {
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
    const userDto = new UserDto();
    const payload = {
      username: signIn.username,
      sub: {
        name: userDto.name,
        sid: userDto.studentID,
      },
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async refreshToken(signIn: SigninDto) {
    const userDto = new UserDto();
    const payload = {
      username: signIn.username,
      sub: {
        name: userDto.name,
        studentId: userDto.studentID,
      },
    };
    return {
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
}
