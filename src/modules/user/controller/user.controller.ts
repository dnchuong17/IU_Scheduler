import { Body, Controller, Post } from '@nestjs/common';
import { UserDto } from '../user.dto';

@Controller('user')
export class UserController {
  @Post()
  createUser(@Body() userDto: UserDto) {
    return { message: 'User created successfully', user: userDto };
  }
}
