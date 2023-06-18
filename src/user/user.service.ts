import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from './dto/createUserDto';
import * as bcrypt from 'bcrypt';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = plainToClass(User, createUserDto);
    user.password = hashedPassword;

    const validationErrors = await validate(user);

    if (validationErrors.length > 0) {
      throw new BadRequestException(validationErrors);
    }

    try {
      const savedUser = await this.userRepository.save(user);
      delete savedUser.password;
      return savedUser;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Email already exists');
      } else {
        throw error;
      }
    }
  }

  async findOne(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findAllByFilters(filters: Record<string, any>): Promise<User[]> {
    const whereClause: Record<string, any> = {};

    if (filters.created_at) {
      const operator = filters.created_at.operator;
      const value = filters.created_at.value;
      const dateValue = new Date(value);

      switch (operator) {
        case '=':
          whereClause.created_at = dateValue;
          break;
        case '>':
          whereClause.created_at = MoreThan(dateValue);
          break;
        case '<':
          whereClause.created_at = LessThan(dateValue);
          break;
        case '>=':
          whereClause.created_at = MoreThanOrEqual(dateValue);
          break;
        case '<=':
          whereClause.created_at = LessThanOrEqual(dateValue);
          break;
        default:
          throw new BadRequestException('Invalid operator for created_at field');
      }
    }

    if (filters.created_at_between && Array.isArray(filters.created_at_between) && filters.created_at_between.length === 2) {
      const startDate = new Date(filters.created_at_between[0]);
      const endDate = new Date(filters.created_at_between[1]);
      startDate.setUTCHours(0, 0, 0, 0);
      endDate.setUTCHours(23, 59, 59, 999);

      if (whereClause.created_at) {
        whereClause.created_at = Between(startDate.toISOString(), endDate.toISOString());
      } else {
        whereClause.created_at = Between(startDate.toISOString(), endDate.toISOString());
      }
    }

    // Iterate over the filters and add non-null values to the where clause
    Object.entries(filters).forEach(([key, value]) => {
      if (key !== 'created_at' && key !== 'created_at_between' && value !== '') {
        whereClause[key] = value;
      }
    });

    return this.userRepository.find({ where: whereClause });
  }
}
