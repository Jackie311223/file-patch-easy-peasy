import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

@Controller('auth')
export class AuthController {
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    // Demo logic: chỉ cho phép đăng nhập với email và password cố định
    if (loginDto.email === 'admin@example.com' && loginDto.password === '123456') {
      return {
        user: { id: 1, email: loginDto.email, name: 'Demo User' },
        token: 'demo-token'
      };
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}