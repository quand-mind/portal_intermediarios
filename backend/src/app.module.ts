import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PartnerModuleRegisterOptions } from '@jsotoexelixitech/nest-api-sdk';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    MailModule,
    HealthModule,
    AuthModule,
  ],
  exports: [ConfigModule, DatabaseModule, MailModule, HealthModule, AuthModule],
})
export class AppModule {
  static register(_options?: PartnerModuleRegisterOptions): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DatabaseModule,
        MailModule,
        HealthModule,
        AuthModule,
      ],
      exports: [ConfigModule, DatabaseModule, MailModule, HealthModule, AuthModule],
    };
  }
}
