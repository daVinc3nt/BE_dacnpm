import { Controller, Post, Body, Get, Param, Patch, NotFoundException, UseGuards, Headers } from '@nestjs/common';
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

    // -------------------- CREATE USER --------------------
    @ApiOperation({ summary: 'Tạo user mới' })
    @ApiResponse({ status: 201, description: 'User được tạo thành công.' })
    @ApiBody({
        description: 'Dữ liệu tạo user',
        schema: {
            example: {
                fullName: "Nguyễn Văn A",
                email: "quangtran.dvincent@gmail.com",
                googleId: "1234567890",
                avaUrl: "https://example.com/avatar.png",
            }
        }
    })
    @Post('create')
    async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.userService.createUser(createUserDto);
    }

    // -------------------- GET ALL USERS --------------------
    @ApiOperation({ summary: 'Lấy danh sách tất cả user' })
    @ApiResponse({ status: 200, description: 'Danh sách user.' })
    @Get()
    async getAllUsers(): Promise<User[]> {
        return this.userService.findAll();
    }

    // -------------------- UPDATE USER --------------------
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
    @Patch('update/:id')
    async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
        return this.userService.updateUser(id, updateUserDto);
    }
    // -------------------- GET USER INFO FROM TOKEN --------------------
    @ApiOperation({ summary: 'Lấy thông tin user từ token' })
    @ApiResponse({ status: 200, description: 'Trả về thông tin user.' })
    @ApiResponse({ status: 401, description: 'Token không hợp lệ hoặc không được cung cấp.' })

    @Get('info')
    async getUserInfo(@Headers('Authorization') authorization: string): Promise<User> {
        if (!authorization) {
            throw new NotFoundException('Authorization header is missing');
        }
        const token = authorization.replace('Bearer ', ''); // Extract token from "Bearer <token>"
        const user = await this.userService.getUserFromToken(token);
        if (!user) {
            throw new NotFoundException('User không tồn tại hoặc token không hợp lệ');
        }
        return user;
    }
}
