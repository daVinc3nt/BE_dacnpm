import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';

config();

@Injectable()
export class AuthService {
  private readonly googleClientId = process.env.GOOGLE_CLIENT_ID;
  private readonly googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  private readonly googleRedirectUri = process.env.GOOGLE_REDIRECT_URI;
  private readonly jwtSecret = process.env.JWT_SECRET;

  constructor(
    private readonly userService: UserService, // Dùng UserService thay vì repository trực tiếp
  ) {}

  getGoogleAuthURL(): string {
    const scope = encodeURIComponent('email profile');
    return `https://accounts.google.com/o/oauth2/auth?client_id=${this.googleClientId}&redirect_uri=${this.googleRedirectUri}&response_type=code&scope=${scope}`;
  }
  async handleGoogleCallback(code: string): Promise<string> {
    // 1. Lấy thông tin user từ Google
    const googleUser = await this.getGoogleUser(code);

    // 2. Kiểm tra hoặc tạo user trong DB thông qua UserService
    const user: User = await this.userService.findOrCreateUser(googleUser);

    // 3. Tạo JWT token
    const payload = {
      id: user.id, 
      email: user.email, 
      fullname: user.fullName,  
      avatar: user.avaUrl
    };
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '1h' });
  }

  // 🛠 **Tách riêng hàm lấy thông tin user từ Google OAuth**
  private async getGoogleUser(code: string): Promise<any> {
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';

    try {
      // Đổi code lấy access_token
      const { data } = await axios.post(tokenUrl, {
        code,
        client_id: this.googleClientId,
        client_secret: this.googleClientSecret,
        redirect_uri: this.googleRedirectUri,
        grant_type: 'authorization_code',
      });

      const accessToken = data.access_token;
      if (!accessToken) throw new InternalServerErrorException('Failed to get access token');

      // Lấy thông tin user từ Google
      const { data: googleUser } = await axios.get(userInfoUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!googleUser.email) throw new InternalServerErrorException('Failed to fetch user info');

      return googleUser;
    } catch (error) {
      console.error('Google OAuth Error:', error?.response?.data || error.message);
      throw new InternalServerErrorException('Authentication failed');
    }
  }
  
}
