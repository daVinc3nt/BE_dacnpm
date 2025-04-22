import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/user.create.dto';
import { UpdateUserDto } from './dtos/user.update.dto';
import * as jwt from 'jsonwebtoken';
import { isUUID } from 'class-validator';
import { BaseService } from 'src/common/service/base_service';
import { Logger } from '@nestjs/common';

@Injectable()
export class UserService extends BaseService<User, Repository<User>> {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        protected readonly logger: Logger
    ) {
        super(userRepository, logger)
    }

    // ✅ Tạo user với kiểm tra email trùng lặp
    async createUser(dto: CreateUserDto): Promise<User> {
        const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });

        if (existingUser) {
            throw new ConflictException(`Email ${dto.email} đã tồn tại!`);
        }

        const newUser = this.userRepository.create(dto);
        const savedUser = await this.userRepository.save(newUser);

        if (!savedUser) {
            throw new BadRequestException('Tạo user thất bại. Vui lòng thử lại!');
        }

        return savedUser;
    }

    // ✅ Tìm user theo email
    async findUserByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            throw new NotFoundException(`Không tìm thấy user với email ${email}`);
        }

        return user;
    }

    // ✅ Cập nhật thông tin user
    async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
        const existingUser = await super.findById(id);

        if (!existingUser) {
            throw new NotFoundException(`User với ID ${id} không tồn tại`);
        }

        await this.userRepository.update(id, dto);
        return super.findById(id);
    }

    // ✅ Tìm hoặc tạo user từ thông tin Google
    async findOrCreateUser(googleUser: any): Promise<User> {
        let user = await this.userRepository.findOne({ where: { email: googleUser.email } });

        if (!user) {
            user = this.userRepository.create({
                fullName: googleUser.name,
                email: googleUser.email,
                googleId: googleUser.id,
                avaUrl: googleUser.picture,
            });

            user = await this.userRepository.save(user);
        }

        return user;
    }

    // ✅ Tìm user theo Google ID
    async findUserByGoogleId(googleId: string): Promise<User | undefined> {
        return this.userRepository.findOne({ where: { googleId } });
    }

    // ✅ Lấy thông tin user từ token
    async getUserFromToken(token: string): Promise<User | undefined> {
        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'defaultSecret'); // Decode the token
            const userId = decoded.id; // Extract user ID from the token payload
            return super.findById(userId); // Fetch user information by ID
        } catch (error) {
            console.error('Error decoding token:', error.message); // Log the error
            throw new Error('Invalid token');
        }
    }
}
