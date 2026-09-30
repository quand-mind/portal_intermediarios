'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { authApi } from '@/lib/api';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState(() => searchParams.get('email') || '');
  const [token] = useState(() => searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !token.trim() || !password.trim()) {
      setErrorMessage(
        !token.trim()
          ? 'El enlace no contiene un token válido. Por favor solicite uno nuevo.'
          : 'Todos los campos son obligatorios.',
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await authApi.resetPassword(email.trim(), token.trim(), password);

      if (res.status) {
        setSuccessMessage('¡Contraseña actualizada con éxito! Redirigiendo al inicio de sesión...');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setErrorMessage(res.message || 'Error al restablecer la contraseña.');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error al restablecer contraseña.';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden bg-gradient-to-br from-[#e8edf5] via-[#f1f5fa] to-[#dbe5f1]">
      {/* Background Decorative Lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-200/40 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-200/30 blur-[100px] pointer-events-none" />

      {/* Top action indicator */}
      <div className="w-full max-w-md mb-3 flex items-center justify-start text-xs font-medium text-slate-500">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 rounded-md hover:bg-white/50 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a Iniciar sesión</span>
        </Link>
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
            Restablecer Contraseña
          </h1>
          <p className="text-[12px] text-slate-500 text-center font-medium mt-0.5">
            Ingrese su nueva contraseña de acceso
          </p>
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Campo Correo */}
          <div className="space-y-1">
            <label
              htmlFor="email-input"
              className="block text-xs font-semibold text-slate-700"
            >
              Correo Electrónico
            </label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@lamundialdeseguros.com"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white"
              required
            />
          </div>

          {/* Token oculto en segundo plano */}
          <input type="hidden" name="token" value={token} />

          {/* Campo Nueva Contraseña */}
          <div className="space-y-1">
            <label
              htmlFor="new-password"
              className="block text-xs font-semibold text-slate-700"
            >
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full h-10 px-3.5 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Campo Confirmar Contraseña */}
          <div className="space-y-1">
            <label
              htmlFor="confirm-password"
              className="block text-xs font-semibold text-slate-700"
            >
              Confirmar Contraseña
            </label>
            <input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita la nueva contraseña"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white"
              required
            />
          </div>

          {/* Botón Submit */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Actualizando contraseña...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Restablecer Contraseña</span>
                </>
              )}
            </button>

            <Link
              href="/"
              className="w-full h-10 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <span>Cancelar y Volver</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#eef3f9]">
          <Loader2 className="w-8 h-8 animate-spin text-[#0f274a]" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
