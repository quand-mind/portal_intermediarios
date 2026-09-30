import { Controller, Get, Inject, Optional } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  EXELIXI_PARTNER_HOST,
  ExelixiPartnerHost,
} from '@jsotoexelixitech/nest-api-sdk';
import { DatabaseService } from '../database/database.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly databaseService: DatabaseService,
    @Optional()
    @Inject(EXELIXI_PARTNER_HOST)
    private readonly host?: ExelixiPartnerHost,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Health check del servicio y base de datos',
    description: 'Retorna el estado del backend de Portal Intermediarios y la conexión a SQL Server',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        status: 'ok',
        service: 'portal-intermediarios-backend',
        version: '1.0.0',
        timestamp: '2026-09-30T18:30:00.000Z',
        environment: 'development',
        database: {
          isConnected: true,
          server: '172.30.149.67',
          database: 'sis2000_QA',
        },
      },
    },
  })
  async getHealth() {
    this.host?.log('log', 'GET /api/v1/health', 'HealthController');

    const dbHealth = await this.databaseService.checkConnection();

    return {
      status: dbHealth.isConnected ? 'ok' : 'degraded',
      service: 'portal-intermediarios-backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: this.host?.getConfig('AMBIENTE') ?? process.env['AMBIENTE'] ?? 'LOCAL',
      database: dbHealth,
    };
  }
}
