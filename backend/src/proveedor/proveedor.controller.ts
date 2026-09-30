import { Controller, Get, Post, Body, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ProveedorService } from './proveedor.service';

@ApiTags('Proveedor')
@Controller('proveedor')
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) {}

  @Get('metrics')
  @ApiOperation({
    summary: 'Obtener métricas y resumen del proveedor',
    description: 'Retorna conteos de pólizas, recibos, asegurados y estado de conexión',
  })
  async getMetrics() {
    return await this.proveedorService.getMetrics();
  }

  @Get('polizas')
  @ApiOperation({ summary: 'Listado de pólizas del proveedor' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPolizas(@Query('limit') limit?: number) {
    return await this.proveedorService.getPolizas(limit ? Number(limit) : 50);
  }

  @Get('recibos')
  @ApiOperation({ summary: 'Listado de recibos del proveedor' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecibos(@Query('limit') limit?: number) {
    return await this.proveedorService.getRecibos(limit ? Number(limit) : 50);
  }

  @Get('clientes')
  @ApiOperation({ summary: 'Listado de clientes/asegurados del proveedor' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getClientes(@Query('limit') limit?: number) {
    return await this.proveedorService.getClientes(limit ? Number(limit) : 50);
  }

  @Post('consultar-asegurabilidad')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Acción: Consultar Asegurabilidad',
    description: 'Valida la cobertura, estatus y vigencia de un asegurado por cédula, RIF o número de póliza.',
  })
  async consultarAsegurabilidad(@Body() body: { search: string }) {
    return await this.proveedorService.consultarAsegurabilidad(body.search || '');
  }

  @Post('consultar-recibos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Acción: Consulta de Recibos',
    description: 'Busca recibos por número de recibo, número de póliza o cliente.',
  })
  async consultarRecibos(@Body() body: { search?: string; cnpoliza?: string }) {
    return await this.proveedorService.consultarRecibos(body);
  }
}
