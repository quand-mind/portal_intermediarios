import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PartnerModuleRegisterOptions } from '@jsotoexelixitech/nest-api-sdk';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    HealthModule,
  ],
  exports: [ConfigModule, DatabaseModule, HealthModule],
})
export class AppModule {
  static register(_options?: PartnerModuleRegisterOptions): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DatabaseModule,
        HealthModule,
      ],
      exports: [ConfigModule, DatabaseModule, HealthModule],
    };
  }
}
