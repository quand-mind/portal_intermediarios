export { AppModule } from './app.module';
export { DatabaseModule } from './database/database.module';
export { DatabaseService } from './database/database.service';
export { HealthModule } from './health/health.module';
export { HealthController } from './health/health.controller';

import { AppModule } from './app.module';

/** Entrada estándar que carga sysip-nest-api vía PARTNER_PACKAGES si aplica. */
export function register(
  options?: import('@jsotoexelixitech/nest-api-sdk').PartnerModuleRegisterOptions,
) {
  return AppModule.register(options);
}
