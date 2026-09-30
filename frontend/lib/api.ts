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
