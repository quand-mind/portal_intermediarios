'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Building2,
} from 'lucide-react';
import { authApi, LoginResponse } from '@/lib/api';

type AuthViewMode = 'login' | 'forgot-request' | 'reset-confirm' | 'logged-in';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // View state
  const [viewMode, setViewMode] = useState<AuthViewMode>('login');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot / Reset states
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [resetConfirmPasswordVal, setResetConfirmPasswordVal] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Response / Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loggedUser, setLoggedUser] = useState<LoginResponse['user'] | null>(null);

  // Check URL query parameters for reset token or email
  useEffect(() => {
    const urlToken = searchParams.get('token');
    const urlEmail = searchParams.get('email');

    if (urlToken) {
      setResetToken(urlToken);
      if (urlEmail) {
        setForgotEmail(urlEmail);
      }
      setViewMode('reset-confirm');
      setSuccessMessage('Token detectado. Por favor ingrese su nueva contraseña.');
    }
  }, [searchParams]);

  // Limpiar mensajes al cambiar de pestaña
  const switchView = (mode: AuthViewMode) => {
    setViewMode(mode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // 1. Manejar Inicio de Sesión
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Por favor ingrese su usuario/correo y contraseña.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await authApi.login(loginEmail.trim(), loginPassword);
      if (res.status) {
        setSuccessMessage('¡Bienvenido al Portal de Proveedores!');
        setLoggedUser(res.user || null);
        if (res.token) {
          localStorage.setItem('portal_token', res.token);
          if (res.user) {
            localStorage.setItem('portal_user', JSON.stringify(res.user));
          }
        }
        // Redirección inmediata al Dashboard de Proveedores
        router.push('/dashboard');
      } else {
        setErrorMessage(res.message || 'Error de credenciales.');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error al conectar con el servidor.';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Manejar Solicitud de Enlace de Restablecimiento
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!forgotEmail.trim()) {
      setErrorMessage('Por favor ingrese el correo electrónico registrado.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await authApi.forgotPassword(forgotEmail.trim());
      if (res.status) {
        setSuccessMessage(res.message);
        if (res.token) {
          setResetToken(res.token);
        }
      } else {
        setErrorMessage(res.message || 'No fue posible enviar el enlace.');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error al procesar la solicitud.';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Manejar Confirmación de Nueva Contraseña
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!forgotEmail.trim() || !resetToken.trim() || !resetPasswordVal.trim()) {
      setErrorMessage('Todos los campos son obligatorios.');
      return;
    }

    if (resetPasswordVal !== resetConfirmPasswordVal) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    if (resetPasswordVal.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await authApi.resetPassword(
        forgotEmail.trim(),
        resetToken.trim(),
        resetPasswordVal,
      );
      if (res.status) {
        setSuccessMessage('¡Contraseña actualizada exitosamente! Ya puede iniciar sesión.');
        setLoginEmail(forgotEmail);
        setLoginPassword('');
        setTimeout(() => {
          switchView('login');
        }, 2000);
      } else {
        setErrorMessage(res.message || 'Error al restablecer la contraseña.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al restablecer contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden bg-gradient-to-br from-[#e8edf5] via-[#f1f5fa] to-[#dbe5f1]">
      {/* Background Decorative Lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-200/40 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-200/30 blur-[100px] pointer-events-none" />

      {/* Top action indicator (matching screenshot) */}
      <div className="w-full max-w-md mb-3 flex items-center justify-start text-xs font-medium text-slate-500">
        {viewMode !== 'login' ? (
          <button
            type="button"
            onClick={() => switchView('login')}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 rounded-md hover:bg-white/50 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Iniciar sesión</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 opacity-80 select-none py-1 px-2">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>La Mundial de Seguros &bull; Portal de Proveedores</span>
          </div>
        )}
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-[430px] bg-white/95 backdrop-blur-md rounded-[28px] shadow-[0_20px_50px_rgba(15,39,74,0.12)] border border-white/80 p-7 sm:p-9 relative z-10 transition-all duration-300">

        {/* LOGO & BRANDING BADGE */}
        <div className="flex flex-col items-center mb-6">
          <div className="mb-3 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://sys2000.lamundialdeseguros.com/assets/img/mundial_logo.png"
              alt="La Mundial de Seguros"
              className="h-16 max-w-[220px] w-auto object-contain drop-shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1 text-[15px] font-bold tracking-wider text-[#0f274a] uppercase text-center">
            <span>La Mundial de Seguros</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-3">
            Portal de Proveedores
          </span>

          <h1 className="text-2xl font-bold text-[#0f274a] tracking-tight">
            {viewMode === 'login' && 'Iniciar sesión'}
            {viewMode === 'forgot-request' && 'Recuperar Contraseña'}
            {viewMode === 'reset-confirm' && 'Nueva Contraseña'}
            {viewMode === 'logged-in' && 'Sesión Iniciada'}
          </h1>


        </div>

        {/* NOTIFICATIONS & ALERTS */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: LOGIN FORM */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* HIDDEN: Tipo de acceso (Requerimiento explícito: Hide the input "Tipo de Acceso") */}
            <input type="hidden" name="tipoAcceso" value="admin" />

            {/* Campo: Usuario */}
            <div className="space-y-1.5">
              <label
                htmlFor="usuario-input"
                className="block text-xs font-semibold text-slate-700"
              >
                Usuario
              </label>
              <div className="relative">
                <input
                  id="usuario-input"
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin o usuario@correo.com"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
                  required
                />
                <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Campo: Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password-input"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => switchView('forgot-request')}
                  className="text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Botón Principal: Ingresar al portal */}
            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[#0f274a] hover:bg-[#163a6d] active:scale-[0.99] text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#0f274a]/20 transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>Ingresar al portal</span>
                  </>
                )}
              </button>

              {/* Botón Secundario: Cambiar o Registrar contraseña (Reemplazando + Regístrate) */}
              <button
                type="button"
                onClick={() => switchView('forgot-request')}
                className="w-full h-10 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99] text-slate-700 font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                <span>Cambiar o Registrar contraseña</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <span className="text-[11px] text-slate-400">
                Acceso autorizado para intermediarios y productores
              </span>
            </div>
          </form>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: SOLICITAR ENLACE / FORGOT PASSWORD */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'forgot-request' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-800 leading-relaxed">
              Ingrese el correo electrónico registrado en nuestro sistema, para enviarle el enlace de cambio de contraseña.
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="forgot-email"
                className="block text-xs font-semibold text-slate-700"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="usuario@lamundialdeseguros.com"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
                  required
                />
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[#0f274a] hover:bg-[#163a6d] active:scale-[0.99] text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#0f274a]/20 transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando solicitud...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Enviar enlace al correo</span>
                  </>
                )}
              </button>

              {/* <button
                type="button"
                onClick={() => switchView('reset-confirm')}
                className="w-full h-10 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99] text-slate-700 font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                <span>Ya tengo un Token / Código</span>
              </button> */}
            </div>
          </form>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 3: CONFIRMAR NUEVA CONTRASEÑA / RESET CONFIRM */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'reset-confirm' && (
          <form onSubmit={handleResetPassword} className="space-y-3.5">
            <div className="space-y-1">
              <label
                htmlFor="reset-email-input"
                className="block text-xs font-semibold text-slate-700"
              >
                Correo Electrónico
              </label>
              <input
                id="reset-email-input"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="usuario@lamundialdeseguros.com"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white"
                required
              />
            </div>

            {/* Token manejado de forma interna / oculta */}
            <input type="hidden" name="token" value={resetToken} />

            <div className="space-y-1">
              <label
                htmlFor="reset-password-input"
                className="block text-xs font-semibold text-slate-700"
              >
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  id="reset-password-input"
                  type={showResetPassword ? 'text' : 'password'}
                  value={resetPasswordVal}
                  onChange={(e) => setResetPasswordVal(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full h-10 px-3.5 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showResetPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="reset-confirm-password-input"
                className="block text-xs font-semibold text-slate-700"
              >
                Confirmar Contraseña
              </label>
              <input
                id="reset-confirm-password-input"
                type={showResetPassword ? 'text' : 'password'}
                value={resetConfirmPasswordVal}
                onChange={(e) => setResetConfirmPasswordVal(e.target.value)}
                placeholder="Repita la nueva contraseña"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando contraseña...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Guardar y Actualizar</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 4: LOGGED IN STATE / DASHBOARD WELCOME */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'logged-in' && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {loggedUser?.xnombre || loggedUser?.xusuario || 'Intermediario'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {loggedUser?.xcorreo || 'Sesión verificada'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-left text-xs text-slate-600 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">ID Usuario:</span>
                <span className="font-bold text-slate-700">{loggedUser?.xusuario || loggedUser?.cusuario}</span>
              </div>
              {loggedUser?.ccorredor && (
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Corredor:</span>
                  <span className="font-semibold text-slate-700">{loggedUser.ccorredor}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Tipo Token:</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">
                  {loggedUser?.type || 'logged'}
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  alert('Redirigiendo al panel de intermediarios...');
                }}
                className="w-full h-11 bg-[#0f274a] hover:bg-[#163a6d] text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#0f274a]/20 cursor-pointer"
              >
                <span>Continuar al Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('portal_token');
                  localStorage.removeItem('portal_user');
                  setLoggedUser(null);
                  switchView('login');
                }}
                className="w-full h-10 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs rounded-xl cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#eef3f9]">
          <Loader2 className="w-8 h-8 animate-spin text-[#0f274a]" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
