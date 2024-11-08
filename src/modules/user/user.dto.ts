import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class UserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty()
  @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
  password: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @Length(11, 11, { message: 'Student ID must be 11 characters' })
  studentID: string;
}
