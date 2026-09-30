export { AppModule } from './app.module';
export { DatabaseModule } from './database/database.module';
export { DatabaseService } from './database/database.service';
export { MailModule } from './mail/mail.module';
export { MailService } from './mail/mail.service';
export { HealthModule } from './health/health.module';
export { HealthController } from './health/health.controller';
export { AuthModule } from './auth/auth.module';
export { AuthService } from './auth/auth.service';
export { AuthController } from './auth/auth.controller';
export * from './auth/dto';

import { AppModule } from './app.module';

/** Entrada estándar que carga sysip-nest-api vía PARTNER_PACKAGES si aplica. */
export function register(
  options?: import('@jsotoexelixitech/nest-api-sdk').PartnerModuleRegisterOptions,
) {
  return AppModule.register(options);
}
