'use client';

import React from 'react';
import {
  Shield,
  Receipt,
  HeartPulse,
  Clock,
  Layers,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { LoginResponse } from '@/lib/api';
import { DashboardTab, DashboardMetrics, ReciboRecord } from './types';

interface InicioTabProps {
  currentUser: LoginResponse['user'] | null;
  metrics: DashboardMetrics;
  recibos: ReciboRecord[];
  onNavigate: (tab: DashboardTab) => void;
  getUserInitials: (name?: string) => string;
}

export const InicioTab: React.FC<InicioTabProps> = ({
  currentUser,
  metrics,
  recibos,
  onNavigate,
  getUserInitials,
}) => {
  return (
    <div className="p-7 space-y-6 max-w-7xl w-full mx-auto animate-fadeIn">
      {/* HERO WELCOME CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0f274a] text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
            {getUserInitials(currentUser?.xnombre || currentUser?.xusuario)}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100">
                Proveedor de Servicios
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                En línea
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                La Mundial de Seguros
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-[#0f274a] tracking-tight">
              Bienvenido(a), {currentUser?.xnombre || currentUser?.xusuario || 'Proveedor'}
            </h1>
            <p className="text-xs text-slate-500">
              Plataforma de gestión, resolución y auditoría de pólizas, recibos y servicios.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('asegurabilidad')}
          className="px-4 py-2.5 rounded-xl bg-[#0f274a] hover:bg-[#163a6d] text-white text-xs font-semibold transition-colors flex items-center gap-2 shrink-0 cursor-pointer shadow-sm shadow-[#0f274a]/20"
        >
          <HeartPulse className="w-4 h-4 text-rose-300" />
          <span>Consultar Asegurabilidad</span>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </button>
      </div>

      {/* ATTENTION BANNER CARD */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-950 uppercase tracking-wide">
              Gestiones Pendientes de Atención
            </div>
            <div className="text-xs text-amber-800 mt-0.5">
              Tienes <strong className="font-semibold">2 casos</strong> que requieren verificación o conciliación de recibos.
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('recibos')}
          className="px-4 py-2 rounded-xl bg-[#0f274a] hover:bg-[#163a6d] text-white text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>Ver casos pendientes</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Pólizas */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pólizas en Proceso
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#0f274a] mb-2">
            {metrics.polizas.total}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{metrics.polizas.status}</span>
          </div>
        </div>

        {/* Card 2: Clientes */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Clientes / Casos Resueltos
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#0f274a] mb-2">
            {metrics.clientes.total}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{metrics.clientes.status}</span>
          </div>
        </div>

        {/* Card 3: Recibos */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Recibos Totales
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#0f274a] mb-2">
            {metrics.recibos.total}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-blue-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>{metrics.recibos.status}</span>
          </div>
        </div>

        {/* Card 4: Sistema */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Sistema Central
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mb-2">
            {metrics.sistema.status}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{metrics.sistema.sincronizacion}</span>
          </div>
        </div>
      </div>

      {/* Resumen Rápido de Actividad */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-[#0f274a]">Últimos Recibos Emitidos</h3>
          </div>
          <button
            onClick={() => onNavigate('recibos')}
            className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ver todos ({metrics.recibos.total})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Nº Recibo</th>
                <th className="py-2.5 px-4">Nº Póliza</th>
                <th className="py-2.5 px-4">Asegurado</th>
                <th className="py-2.5 px-4">Monto</th>
                <th className="py-2.5 px-4">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recibos.slice(0, 5).map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-4 font-mono font-bold text-blue-700">#{item.cnrecibo}</td>
                  <td className="py-2.5 px-4 font-mono">{item.cnpoliza}</td>
                  <td className="py-2.5 px-4 font-medium uppercase">{item.xasegurado || '---'}</td>
                  <td className="py-2.5 px-4 font-semibold text-emerald-700">
                    {item.mprimatotal ? `$${Number(item.mprimatotal).toFixed(2)}` : '$0.00'}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.iestadorec === 'P'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.iestadorec === 'P' ? 'Pendiente' : 'Cobrado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
