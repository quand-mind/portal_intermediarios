import { Injectable, Inject, Optional, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EXELIXI_PARTNER_HOST, ExelixiPartnerHost } from '@jsotoexelixitech/nest-api-sdk';
import * as sql from 'mssql';

export interface ProcedureParam {
  type: any;
  value: any;
}

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: sql.ConnectionPool | null = null;

  constructor(
    @Optional() private readonly configService?: ConfigService,
    @Optional() @Inject(EXELIXI_PARTNER_HOST) private readonly host?: ExelixiPartnerHost,
  ) {}

  /**
   * Obtiene la configuración de conexión a la base de datos SQL Server
   */
  getSqlConfig(): sql.config {
    return {
      user:
        this.host?.getConfig('USER_BD') ||
        this.configService?.get<string>('USER_BD') ||
        process.env['USER_BD'] ||
        '',
      password:
        this.host?.getConfig('PASSWORD_BD') ||
        this.configService?.get<string>('PASSWORD_BD') ||
        process.env['PASSWORD_BD'] ||
        '',
      server:
        this.host?.getConfig('SERVER_BD') ||
        this.configService?.get<string>('SERVER_BD') ||
        process.env['SERVER_BD'] ||
        '',
      database:
        this.host?.getConfig('NAME_BD') ||
        this.configService?.get<string>('NAME_BD') ||
        process.env['NAME_BD'] ||
        '',
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    };
  }

  /**
   * Obtiene o inicializa el pool de conexión
   */
  async getPool(): Promise<sql.ConnectionPool> {
    if (this.pool && this.pool.connected) {
      return this.pool;
    }

    const config = this.getSqlConfig();
    this.logger.log(`Conectando a base de datos ${config.database} en ${config.server}...`);
    this.pool = await sql.connect(config);
    return this.pool;
  }

  /**
   * Ejecuta un procedimiento almacenado
   */
  async executeProcedure<T = any>(
    procedureName: string,
    inputs: Record<string, ProcedureParam> = {},
  ): Promise<sql.IProcedureResult<T>> {
    const pool = await this.getPool();
    const request = pool.request();

    for (const [key, param] of Object.entries(inputs)) {
      request.input(key, param.type, param.value);
    }

    return await request.execute<T>(procedureName);
  }

  /**
   * Ejecuta una consulta SQL plana
   */
  async query<T = any>(queryText: string): Promise<sql.IResult<T>> {
    const pool = await this.getPool();
    const request = pool.request();
    return await request.query<T>(queryText);
  }

  /**
   * Valida el estado de la conexión a la base de datos
   */
  async checkConnection(): Promise<{ isConnected: boolean; server: string; database: string; error?: string }> {
    const config = this.getSqlConfig();
    try {
      const pool = await this.getPool();
      await pool.request().query('SELECT 1 AS is_alive');
      return {
        isConnected: true,
        server: config.server,
        database: config.database as string,
      };
    } catch (error: any) {
      this.logger.error(`Error verificando conexión a base de datos: ${error.message}`, error.stack);
      return {
        isConnected: false,
        server: config.server,
        database: config.database as string,
        error: error.message,
      };
    }
  }
}
