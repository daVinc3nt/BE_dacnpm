import { Controller, Post, Body, Get, Param, Patch, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/user.create.dto';
import { UpdateUserDto } from './dtos/user.update.dto';
import { User } from './user.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@ApiTags('user') // Nhóm API trong Swagger
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @ApiOperation({ summary: 'Tạo user mới' })
    @ApiResponse({ status: 201, description: 'User được tạo thành công.' })
    @ApiBody({
        description: 'Dữ liệu tạo user',
        schema: {
            example: {
                fullName: "Nguyễn Văn A",
                email: "example@gmail.com",
                googleId: "1234567890",
                avaUrl: "https://example.com/avatar.png",
            }
        }
    })
    @Post('create')
    async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.userService.createUser(createUserDto);
    }

    @ApiOperation({ summary: 'Lấy user theo email' })
    @ApiResponse({ status: 200, description: 'Trả về thông tin user.' })
    @ApiResponse({ status: 404, description: 'User không tồn tại.' })
    @ApiParam({ name: 'email', required: true, description: 'Email của user cần tìm' })
    @Get('email/:email')
    async getUserByEmail(@Param('email') email: string): Promise<User> {
        const user = await this.userService.findUserByEmail(email);
        if (!user) throw new NotFoundException(`User với email ${email} không tồn tại`);
        return user;
    }

    @ApiOperation({ summary: 'Lấy user theo ID' })
    @ApiResponse({ status: 200, description: 'Trả về thông tin user.' })
    @ApiResponse({ status: 404, description: 'User không tồn tại.' })
    @ApiParam({ name: 'id', required: true, description: 'ID của user cần tìm' })
    @Get(':id')
    async getUserById(@Param('id') id: string): Promise<User> {
        return this.userService.findUserById(id);
    }

    @ApiOperation({ summary: 'Lấy danh sách tất cả user' })
    @ApiResponse({ status: 200, description: 'Danh sách user.' })
    @Get()
    async getAllUsers(): Promise<User[]> {
        return this.userService.findAllUser();
    }

    @ApiOperation({ summary: 'Cập nhật thông tin user' })
    @ApiResponse({ status: 200, description: 'User đã được cập nhật.' })
    @ApiResponse({ status: 404, description: 'User không tồn tại.' })
    @ApiParam({ name: 'id', required: true, description: 'ID của user cần cập nhật' })
    @ApiBody({
        description: 'Dữ liệu cập nhật user',
        schema: {
            example: {
                fullName: "Nguyễn Văn B",
                avaUrl: "https://example.com/new-avatar.png",
            }
        }
    })
    @Patch(':id')
    async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
        return this.userService.updateUser(id, updateUserDto);
    }

    @ApiOperation({ summary: 'Tìm hoặc tạo user từ Google OAuth' })
    @ApiResponse({ status: 200, description: 'Trả về thông tin user.' })
    @ApiBody({
        description: 'Thông tin user từ Google',
        schema: {
            example: {
                name: "Nguyễn Văn A",
                email: "example@gmail.com",
                id: "1234567890",
                picture: "https://example.com/avatar.png",
            }
        }
    })
    @Post('google')
    async findOrCreateGoogleUser(@Body() googleUser: any): Promise<User> {
        return this.userService.findOrCreateUser(googleUser);
    }
}
