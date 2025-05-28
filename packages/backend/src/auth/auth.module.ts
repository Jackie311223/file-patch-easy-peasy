import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigService
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { TenantGuard } from './guards/tenant.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    ConfigModule, // Keep ConfigModule imported if needed elsewhere or by JwtModule internally
    JwtModule.registerAsync({
      imports: [ConfigModule], // Keep ConfigModule here as it might be needed by the factory context
      useFactory: async (configService: ConfigService) => ({ // Ensure factory uses ConfigService
        secret: configService.get('JWT_SECRET') || 'default_secret_for_development',
        signOptions: { 
          expiresIn: '30m' // Token expires in 30 minutes
        },
      }),
      inject: [ConfigService], // Inject ConfigService into the factory
    }),
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
