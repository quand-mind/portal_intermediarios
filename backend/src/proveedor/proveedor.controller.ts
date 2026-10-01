import { Controller, Get, Post, Body, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ProveedorService } from './proveedor.service';

@ApiTags('Proveedor')
@Controller('proveedor')
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) { }

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
  @ApiQuery({ name: 'cci_rif', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'iestadorec', required: false, type: String })
  @ApiQuery({ name: 'fdesde', required: false, type: String })
  @ApiQuery({ name: 'fhasta', required: false, type: String })
  async getRecibos(
    @Query('limit') limit?: number,
    @Query('cci_rif') cci_rif?: number,
    @Query('search') search?: string,
    @Query('iestadorec') iestadorec?: string,
    @Query('fdesde') fdesde?: string,
    @Query('fhasta') fhasta?: string,
  ) {
    return await this.proveedorService.getRecibos(
      limit ? Number(limit) : 100,
      cci_rif ? Number(cci_rif) : undefined,
      search,
      iestadorec,
      fdesde,
      fhasta,
    );
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
  async consultarAsegurabilidad(@Body() body: { search: string; cci_rif?: number }) {
    return await this.proveedorService.consultarAsegurabilidad(body.search || '', body.cci_rif ? Number(body.cci_rif) : undefined);
  }

  @Post('consultar-recibos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Acción: Consulta de Recibos',
    description: 'Busca recibos por número de recibo, número de póliza, cliente, fechas y estatus.',
  })
  async consultarRecibos(
    @Body()
    body: {
      search?: string;
      cnpoliza?: string;
      iestadorec?: string;
      cci_rif?: number;
      fdesde?: string;
      fhasta?: string;
      limit?: number;
    },
  ) {
    return await this.proveedorService.consultarRecibos(body);
  }
}
