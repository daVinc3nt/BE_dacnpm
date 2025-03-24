import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/user.create.dto';
import { UpdateUserDto } from './dtos/user.update.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

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

    // ✅ Lấy danh sách tất cả user
    async findAllUser(): Promise<User[]> {
        const users = await this.userRepository.find();

        if (!users.length) {
            throw new NotFoundException('Hiện tại không có user nào trong hệ thống.');
        }

        return users;
    }

    // ✅ Tìm user theo ID
    async findUserById(id: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['devices', 'schedules'], // Load luôn danh sách thiết bị & lịch trình
        });

        if (!user) {
            throw new NotFoundException(`User với ID ${id} không tồn tại`);
        }

        return user;
    }

    // ✅ Cập nhật thông tin user
    async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
        const existingUser = await this.findUserById(id);

        if (!existingUser) {
            throw new NotFoundException(`User với ID ${id} không tồn tại`);
        }

        await this.userRepository.update(id, dto);
        return this.findUserById(id);
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
}
