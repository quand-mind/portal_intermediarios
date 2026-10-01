export type DashboardTab = 'inicio' | 'recibos' | 'clientes' | 'asegurabilidad';

export interface PolizaRecord {
  cnpoliza?: string;
  fanopol?: number;
  fmespol?: number;
  fdesde?: string;
  fhasta?: string;
  iestado?: string;
  mprimatotal?: number;
  xasegurado?: string;
  cidasegurado?: string;
  xplan?: string;
  estatus_asegurabilidad?: string;
}

export interface ReciboRecord {
  cnrecibo?: string;
  cnpoliza?: string;
  fanopol?: number;
  fmespol?: number;
  fdesde?: string;
  fhasta?: string;
  fdesderec?: string;
  fhastarec?: string;
  iestadorec?: string;
  estatus_recibo?: string;
  estatus_asegurabilidad?: string;
  mprimatotal?: number;
  xasegurado?: string;
  cidasegurado?: string;
  xplan?: string;
  xcorreo?: string;
  xtelefono?: string;
}

export interface ClienteRecord {
  cci_rif?: number;
  cid?: string;
  xcliente?: string;
  xcorreo?: string;
  xtelefono_hab?: string;
  xtelefono_cel?: string;
  cestado?: string;
}

export interface DashboardMetrics {
  polizas: { total: number; label: string; status: string };
  recibos: { total: number; label: string; status: string };
  clientes: { total: number; label: string; status: string };
  sistema: { status: string; sincronizacion: string; ambiente: string };
}
