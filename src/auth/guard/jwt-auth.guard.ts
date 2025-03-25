import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly jwtSecret = process.env.JWT_SECRET;
  private readonly specialTestToken = 'TEST_TOKEN';

  canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        
        if (!authHeader) return false;
        const token = authHeader.split(' ')[1]; // Lấy token từ header

        // 🎯 Nếu token là TEST_TOKEN thì luôn cho phép truy cập
        if (token === this.specialTestToken) return true;

        try {
            const decoded = jwt.verify(token, this.jwtSecret);
            request.user = decoded; // Gán user vào request
            return true;
        } catch (err) {
            throw new UnauthorizedException('Token is invalid');
        }
    }
}
