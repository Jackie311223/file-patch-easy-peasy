import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  /**
   * Validates user credentials.
   * @param email User's email
   * @param pass Plain text password
   * @returns User object without password if valid, otherwise null
   */
  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && user.password) {
      const isPasswordMatching = await bcrypt.compare(pass, user.password);
      if (isPasswordMatching) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  async login(user: Omit<User, 'password'>) {
    // Ensure payload contains necessary fields for authorization
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      tenantId: user.tenantId, // Include tenantId if available
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
