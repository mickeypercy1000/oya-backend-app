import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from 'ormconfig';
import { User } from './entities/user.entity';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [TypeOrmModule.forFeature([User]), TypeOrmModule.forRoot(config)],
})
export class AppModule {}
