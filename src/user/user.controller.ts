import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/user.create.dto';
import { User } from './user.entity';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('create')
    async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.userService.createUser(createUserDto);
    }

    @Get(':email')
    async getUser(@Param('email') email: string): Promise<User> {
        return this.userService.findUserByEmail(email);
    }

    @Get()
    async getAllUser(): Promise<User[]> {
        return this.userService.findAllUser();
    }
}
