import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

@Injectable()
export class JwtAuthGuard implements CanActivate {
    private readonly testToken = 'TEST_TOKEN'; // Define a test token

    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authorization = request.headers['authorization'];
        console.log('Authorization header in guard:', authorization); // Log the Authorization header

        if (!authorization) {
            console.log('Authorization header is missing');
            return false;
        }

        const token = authorization.replace('Bearer ', '');

        // Allow requests with the test token
        if (token === this.testToken) {
            return true;
        }

        try {
            jwt.verify(token, process.env.JWT_SECRET || 'defaultSecret');
            return true;
        } catch (error) {
            console.log('Invalid token:', error.message);
            return false;
        }
    }
}
