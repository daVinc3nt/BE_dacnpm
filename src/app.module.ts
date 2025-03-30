import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule as IntervalModule } from '@nestjs/schedule';
import { systemDataSource } from 'ormconfig';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TransformResponseInterceptor } from './common/response';
import { systemDataSource } from 'ormconfig';
import { AuthModule } from './auth /auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(systemDataSource.options),
    UserModule,
    AuthModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
  ],
})
export class AppModule {}
