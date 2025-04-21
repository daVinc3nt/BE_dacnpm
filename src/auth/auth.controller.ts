import { Controller, Get, Headers, Query, Redirect, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google/login')
  async googleLogin(@Res() res: Response) {
    const authUrl = this.authService.getGoogleAuthURL();
    return res.redirect(authUrl);
  }

  @Get('google/callback')
  async googleAuthCallback(@Query('code') code: string, @Res() res: Response) {
    const token = await this.authService.handleGoogleCallback(code);
    return res.redirect(`${process.env.FRONTEND_REDIRECT_URI}?token=${token}`);
  }

  // // -------------------- GET GOOGLE USER --------------------
  // @Get('google/user')
  // async getGoogleUser(@Headers('Authorization') authorization: string): Promise<any> {
  //   if (!authorization) {
  //     throw new Error('Authorization header is missing');
  //   }

  //   const token = authorization.replace('Bearer ', ''); // Extract token from "Bearer <token>"
  //   return this.authService.getGoogleUser(token);
  // }
}
