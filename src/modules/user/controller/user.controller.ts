import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from '../service/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @Get(':id')
  userInfor(@Param('id') id: number) {
    return this.userService.getUserInfor(id);
  }
}
