import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() data: { email: string; password: string; name?: string; roles?: string[] }) {
    return this.usersService.create(data);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }
}