import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/user.create.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async createUser(dto: CreateUserDto): Promise<User> {
        const newUser = this.userRepository.create(dto);
        return this.userRepository.save(newUser);
    }

    async findUserByEmail(email: string): Promise<User> {
        return this.userRepository.findOne({ where: { email } });
    }

    async findAllUser(): Promise<User[]> {
        return this.userRepository.find();
    }
}
