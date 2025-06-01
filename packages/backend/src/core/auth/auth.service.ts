import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  /**
   * Validates user credentials.
   * @param email User's email
   * @param pass Plain text password
   * @returns User object without password if valid, otherwise null
   */
  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && user.password) {
      const isPasswordMatching = await bcrypt.compare(pass, user.password);
      if (isPasswordMatching) {
        const { password, ...result } = user; // Exclude password from the returned object
        return result;
      }
    }
    return null;
  }

  /**
   * Generates a JWT token for a validated user.
   * @param user User object (result from validateUser)
   * @returns Object containing the access token
   */
  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isPasswordMatching = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordMatching) throw new UnauthorizedException('Invalid credentials');
    return user;
  }
}
