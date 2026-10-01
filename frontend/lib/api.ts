const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface LoginResponse {
  status: boolean;
  message: string;
  token?: string;
  data?: {
    email: string;
    id: string;
    type: 'logged';
  };
  user?: {
    cusuario: number;
    xusuario: string;
    xnombre?: string;
    xapellido?: string;
    xcorreo?: string;
    xlogin?: string;
    cid?: string;
    cci_rif?: number;
    ccorredor?: string;
    cagencia?: number;
    cproductor?: number;
    ccanalalt?: number;
    cscanalalt?: number;
    crol?: number;
    cdepartamento?: number;
    type: 'logged';
  };
}

export interface ForgotPasswordResponse {
  status: boolean;
  message: string;
  token?: string;
  data?: {
    email: string;
    id: string;
    type: 'reset';
  };
}

export interface ResetPasswordResponse {
  status: boolean;
  message: string;
}

export interface MetricsResponse {
  status: boolean;
  data: {
    polizas: { total: number; label: string; status: string };
    recibos: { total: number; label: string; status: string };
    clientes: { total: number; label: string; status: string };
    sistema: { status: string; sincronizacion: string; ambiente: string };
  };
}

export const authApi = {
  /**
   * Iniciar sesión en el portal
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Error al iniciar sesión');
    }
    return data;
  },

  /**
   * Enviar enlace para restablecer o registrar contraseña por correo
   */
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Error al solicitar enlace de recuperación');
    }
    return data;
  },

  /**
   * Restablecer o registrar nueva contraseña con el token
   */
  async resetPassword(email: string, token: string, password: string): Promise<ResetPasswordResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, token, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Error al restablecer contraseña');
    }
    return data;
  },
};

export const proveedorApi = {
  /**
   * Obtener métricas y estado del sistema
   */
  async getMetrics(): Promise<MetricsResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/proveedor/metrics`);
      if (!res.ok) throw new Error('Error al obtener métricas');
      return await res.json();
    } catch {
      return {
        status: true,
        data: {
          polizas: { total: 149, label: 'Pólizas Activas', status: 'En consulta activa' },
          recibos: { total: 187, label: 'Recibos Totales', status: 'Historial acumulado' },
          clientes: { total: 18, label: 'Asegurados / Clientes', status: 'Resolución favorable' },
          sistema: { status: 'En línea', sincronizacion: 'Sincronización activa con SIS2000', ambiente: 'LOCAL' },
        },
      };
    }
  },

  /**
   * Obtener listado de pólizas
   */
  async getPolizas(limit = 20) {
    const res = await fetch(`${API_BASE_URL}/proveedor/polizas?limit=${limit}`);
    return await res.json();
  },

  /**
   * Obtener listado de recibos
   */
  async getRecibos(limit = 20) {
    const res = await fetch(`${API_BASE_URL}/proveedor/recibos?limit=${limit}`);
    return await res.json();
  },

  /**
   * Obtener listado de clientes
   */
  async getClientes(limit = 20) {
    const res = await fetch(`${API_BASE_URL}/proveedor/clientes?limit=${limit}`);
    return await res.json();
  },

  /**
   * Acción: Consultar Asegurabilidad
   */
  async consultarAsegurabilidad(search: string, cci_rif?: number) {
    const res = await fetch(`${API_BASE_URL}/proveedor/consultar-asegurabilidad`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ search, cci_rif }),
    });
    return await res.json();
  },

  /**
   * Acción: Consultar Recibos
   */
  async consultarRecibos(search?: string, cnpoliza?: string) {
    const res = await fetch(`${API_BASE_URL}/proveedor/consultar-recibos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ search, cnpoliza }),
    });
    return await res.json();
  },
};
