import { Body, Controller, Get, Param, Post, NotFoundException, Query } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from './dto/createUserDto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return await this.userService.findOne(id);
  }

  @Get()
  async findAll(
    @Query('filter') filter?: string,
    @Query('created_at') createdAtFilter?: string,
  ): Promise<User[]> {
    const filters = filter ? JSON.parse(filter) : {};
    if (createdAtFilter) {
      filters.created_at = {
        operator: createdAtFilter.substr(0, 2),
        value: createdAtFilter.substr(2),
      };
    }
    const users = await this.userService.findAllByFilters(filters);
    if (users.length === 0) {
      throw new NotFoundException('No users found with the provided filters');
    }
    return users;
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const createdUser = await this.userService.createUser(createUserDto);
    return { user: createdUser };
  }
}
