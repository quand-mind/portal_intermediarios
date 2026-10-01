'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Receipt,
  Users,
  Search,
  Bell,
  HelpCircle,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Building2,
  Clock,
  Layers,
  ChevronRight,
  RefreshCw,
  Loader2,
  FileCheck,
  UserCheck,
  UserX,
} from 'lucide-react';
import { proveedorApi, LoginResponse } from '@/lib/api';

type DashboardTab = 'inicio' | 'recibos' | 'clientes' | 'asegurabilidad';

interface PolizaRecord {
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

interface ReciboRecord {
  cnrecibo?: string;
  cnpoliza?: string;
  fanopol?: number;
  fmespol?: number;
  fdesde?: string;
  fhasta?: string;
  iestadorec?: string;
  mprimatotal?: number;
  xasegurado?: string;
  cidasegurado?: string;
}

interface ClienteRecord {
  cci_rif?: number;
  cid?: string;
  xcliente?: string;
  xcorreo?: string;
  xtelefono_hab?: string;
  xtelefono_cel?: string;
  cestado?: string;
}

function DashboardContent() {
  const router = useRouter();

  // User state from localStorage
  const [currentUser] = useState<LoginResponse['user'] | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('portal_user');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<DashboardTab>('inicio');

  // Metrics and Data states
  const [metrics, setMetrics] = useState({
    polizas: { total: 149, label: 'Pólizas Activas', status: 'En consulta activa' },
    recibos: { total: 187, label: 'Recibos Totales', status: 'Historial acumulado' },
    clientes: { total: 18, label: 'Asegurados / Clientes', status: 'Resolución favorable' },
    sistema: { status: 'En línea', sincronizacion: 'Sincronización activa con SIS2000', ambiente: 'LOCAL' },
  });

  const [polizas, setPolizas] = useState<PolizaRecord[]>([]);
  const [recibos, setRecibos] = useState<ReciboRecord[]>([]);
  const [clientes, setClientes] = useState<ClienteRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Asegurabilidad View Search state
  const [asegurabilidadSearch, setAsegurabilidadSearch] = useState('');
  const [asegurabilidadResults, setAsegurabilidadResults] = useState<PolizaRecord[] | null>(null);
  const [isSearchingAseg, setIsSearchingAseg] = useState(false);
  const [hasSearchedAseg, setHasSearchedAseg] = useState(false);

  // Filter in tables
  const [tableFilter, setTableFilter] = useState('');

  const loadDashboardData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [metricsRes, polizasRes, recibosRes, clientesRes] = await Promise.all([
        proveedorApi.getMetrics(),
        proveedorApi.getPolizas(20),
        proveedorApi.getRecibos(20),
        proveedorApi.getClientes(20),
      ]);

      if (metricsRes?.data) setMetrics(metricsRes.data);
      if (polizasRes?.data) setPolizas(polizasRes.data);
      if (recibosRes?.data) setRecibos(recibosRes.data);
      if (clientesRes?.data) setClientes(clientesRes.data);
    } catch (err) {
      console.error('Error loading dashboard data', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (isMounted) {
        await loadDashboardData();
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [loadDashboardData]);

  const handleLogout = () => {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_user');
    router.push('/');
  };

  // Ejecutar Acción: Consultar Asegurabilidad
  const handleSearchAsegurabilidad = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!asegurabilidadSearch.trim()) return;

    setIsSearchingAseg(true);
    setHasSearchedAseg(true);
    try {
      const cciRif = currentUser?.cci_rif ? Number(currentUser.cci_rif) : (currentUser?.xusuario ? Number(currentUser.xusuario) : undefined);
      const res = await proveedorApi.consultarAsegurabilidad(asegurabilidadSearch.trim(), cciRif);
      setAsegurabilidadResults(res.data || []);
    } catch (err) {
      console.error(err);
      setAsegurabilidadResults([]);
    } finally {
      setIsSearchingAseg(false);
    }
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'LM';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen flex bg-[#f0f4f9] text-[#1e293b] font-sans antialiased">
      {/* ----------------------------------------------------------------- */}
      {/* LEFT SIDEBAR (Matching Dark Theme from Screenshot) */}
      {/* ----------------------------------------------------------------- */}
      <aside className="w-64 bg-[#0a1b33] text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800 select-none">
        <div>
          {/* Brand Logo Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://sys2000.lamundialdeseguros.com/assets/img/mundial_logo.png"
                alt="La Mundial"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="text-white font-bold text-sm tracking-tight leading-none">
                La Mundial
              </div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
                Portal Proveedores
              </div>
            </div>
          </div>

          {/* Subheader / Status */}
          <div className="px-5 py-3 text-[11px] text-slate-400 bg-[#081528] flex items-center justify-between border-b border-slate-800/60">
            <span className="font-medium">Ambiente:</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-semibold">
              QA / Local
            </span>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1">
            <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Menú Principal
            </div>

            {/* Item 1: Inicio */}
            <button
              onClick={() => setActiveTab('inicio')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === 'inicio'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
            >
              <div className={`p-1 rounded-lg ${activeTab === 'inicio' ? 'bg-white/20' : 'bg-slate-800'}`}>
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <span>Inicio</span>
            </button>

            {/* Item 2: Recibos */}
            <button
              onClick={() => setActiveTab('recibos')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === 'recibos'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1 rounded-lg ${activeTab === 'recibos' ? 'bg-white/20' : 'bg-slate-800'}`}>
                  <Receipt className="w-3.5 h-3.5" />
                </div>
                <span>Recibos</span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-md">
                {metrics.recibos.total}
              </span>
            </button>

            {/* Item 3: Clientes */}
            <button
              onClick={() => setActiveTab('clientes')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === 'clientes'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1 rounded-lg ${activeTab === 'clientes' ? 'bg-white/20' : 'bg-slate-800'}`}>
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span>Clientes</span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-md">
                {metrics.clientes.total}
              </span>
            </button>

            {/* Item 4: Asegurabilidad (Dedicated View) */}
            <button
              onClick={() => setActiveTab('asegurabilidad')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === 'asegurabilidad'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
            >
              <div className={`p-1 rounded-lg ${activeTab === 'asegurabilidad' ? 'bg-white/20' : 'bg-slate-800'}`}>
                <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <span>Asegurabilidad</span>
            </button>
          </div>
        </div>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-[#081528]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow">
              {getUserInitials(currentUser?.xnombre || currentUser?.xusuario)}
            </div>
            <div className="truncate flex-1">
              <div className="text-xs font-semibold text-white truncate">
                {currentUser?.xnombre || currentUser?.xusuario || 'Proveedor Activo'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {currentUser?.cid ? `RIF: ${currentUser.cid}` : currentUser?.xcorreo || 'Sesión Autorizada'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-rose-900/40 hover:text-rose-300 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ----------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA */}
      {/* ----------------------------------------------------------------- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-7 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700">La Mundial de Seguros</span>
            <span className="text-xs text-slate-400">&bull; Portal de Proveedores</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadDashboardData}
              title="Actualizar datos"
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            <div className="relative">
              <button
                type="button"
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  2
                </span>
              </button>
            </div>

            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Ayuda</span>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1" />

            <div className="flex items-center gap-2.5 pl-1 py-1 pr-3 rounded-full bg-slate-50 border border-slate-200/80">
              <div className="w-7 h-7 rounded-full bg-[#0f274a] text-white font-bold text-[11px] flex items-center justify-center">
                {getUserInitials(currentUser?.xnombre || currentUser?.xusuario)}
              </div>
              <div className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
                {currentUser?.xnombre || currentUser?.xusuario || 'Proveedor'}
              </div>
            </div>
          </div>
        </header>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: INICIO (Dashboard Overview) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'inicio' && (
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
                onClick={() => setActiveTab('asegurabilidad')}
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
                onClick={() => setActiveTab('recibos')}
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
                  onClick={() => setActiveTab('recibos')}
                  className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
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
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${item.iestadorec === 'P'
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
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: ASEGURABILIDAD (Dedicated Full View) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'asegurabilidad' && (
          <div className="p-7 space-y-6 max-w-7xl w-full mx-auto animate-fadeIn">
            {/* Header Section */}
            <div className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-[#0f274a] text-white flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0f274a] leading-none">Acciones y Servicios</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Gestiones disponibles para tu cuenta de proveedor</p>
              </div>
            </div>

            {/* Consultar Asegurabilidad Card (Matching exact user screenshot) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/70 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100/60 text-rose-500 flex items-center justify-center shadow-xs">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 font-extrabold text-[10px] tracking-wider uppercase border border-rose-100">
                  CONSULTA RÁPIDA
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#0f274a]">
                  Consultar Asegurabilidad
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Verificación inmediata de cobertura, vigencia de póliza y estatus activo de pacientes y asegurados.
                </p>
              </div>

              {/* Formulario de Búsqueda */}
              <form onSubmit={handleSearchAsegurabilidad} className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={asegurabilidadSearch}
                    onChange={(e) => setAsegurabilidadSearch(e.target.value)}
                    placeholder="Ingrese Cédula (V-...) o Nº Póliza"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 placeholder:text-slate-400 shadow-xs"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearchingAseg}
                  className="h-11 px-6 bg-[#0a1b33] hover:bg-[#163a6d] active:scale-[0.99] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 shadow-md shadow-[#0a1b33]/20 shrink-0"
                >
                  {isSearchingAseg ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Consultando...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Consultar</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Resultados de la Consulta */}
            {hasSearchedAseg && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0f274a] flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Resultados de la Validación ({asegurabilidadResults?.length || 0})</span>
                  </h3>
                </div>

                {asegurabilidadResults && asegurabilidadResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {asegurabilidadResults.map((item, idx) => {
                      const isAsegurable = item.iestado === 'V';
                      return (
                        <div
                          key={idx}
                          className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4 relative overflow-hidden"
                        >
                          {/* Status Header Badge */}
                          <div className="flex items-start justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Póliza Registrada
                              </span>
                              <div className="text-base font-extrabold text-[#0f274a] font-mono">
                                #{item.cnpoliza}
                              </div>
                            </div>

                            <div
                              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${isAsegurable
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                                }`}
                            >
                              {isAsegurable ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>ASEGURABLE / ACTIVO</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3.5 h-3.5 text-rose-600" />
                                  <span>NO ASEGURABLE / ANULADO</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Patient / Policy Details Grid */}
                          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 grid grid-cols-2 gap-3 text-xs">
                            <div className="col-span-2">
                              <span className="text-slate-400 text-[10px] block font-medium">
                                Nombre del Asegurado:
                              </span>
                              <strong className="text-slate-800 text-sm uppercase">
                                {item.xasegurado || '---'}
                              </strong>
                            </div>

                            <div>
                              <span className="text-slate-400 text-[10px] block font-medium">
                                Cédula / RIF:
                              </span>
                              <span className="font-mono font-bold text-slate-700">
                                {item.cidasegurado || '---'}
                              </span>
                            </div>

                            <div>
                              <span className="text-slate-400 text-[10px] block font-medium">
                                Plan de Cobertura:
                              </span>
                              <span className="font-semibold text-blue-700">
                                {item.xplan || 'Riesgos Generales'}
                              </span>
                            </div>

                            <div>
                              <span className="text-slate-400 text-[10px] block font-medium">
                                Vigencia Desde:
                              </span>
                              <span className="font-mono text-slate-600">
                                {item.fdesde ? new Date(item.fdesde).toLocaleDateString() : '---'}
                              </span>
                            </div>

                            <div>
                              <span className="text-slate-400 text-[10px] block font-medium">
                                Vigencia Hasta:
                              </span>
                              <span className="font-mono font-semibold text-slate-800">
                                {item.fhasta ? new Date(item.fhasta).toLocaleDateString() : 'Indefinida'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 text-slate-400 space-y-2">
                    <UserX className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">
                      No se encontraron asegurados con los datos suministrados.
                    </p>
                    <p className="text-xs">
                      Verifique que la cédula o número de póliza estén correctamente digitados.
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 3: RECIBOS (Dedicated View) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'recibos' && (
          <div className="p-7 space-y-6 max-w-7xl w-full mx-auto animate-fadeIn">
            {/* Header Section */}
            <div className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-[#0f274a] text-white flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0f274a] leading-none">Acciones y Servicios</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Gestiones disponibles para tu cuenta de proveedor</p>
              </div>
            </div>

            {/* Consulta de Recibos Card (Matching exact user screenshot) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/70 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100/60 text-blue-600 flex items-center justify-center shadow-xs">
                  <Receipt className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-extrabold text-[10px] tracking-wider uppercase border border-blue-100">
                  FACTURACIÓN & COBROS
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#0f274a]">
                  Consulta de Recibos
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Revisión de recibos emitidos, cobranzas pendientes, fechas de vigencia y montos en prima.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={tableFilter}
                    onChange={(e) => setTableFilter(e.target.value)}
                    placeholder="Nº Recibo, Póliza o Nombre"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 placeholder:text-slate-400 shadow-xs"
                  />
                </div>
                <button
                  type="button"
                  className="h-11 px-6 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-600/20 shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Buscar</span>
                </button>
              </div>
            </div>

            {/* Listado de Recibos */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0f274a] border-b-2 border-[#0f274a] pb-1">
                    Recibos ({recibos.length})
                  </span>
                  <span className="text-xs font-semibold text-slate-400 px-2">
                    Clientes ({clientes.length})
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Nº Recibo</th>
                      <th className="py-3 px-4">Nº Póliza</th>
                      <th className="py-3 px-4">Asegurado</th>
                      <th className="py-3 px-4">Cédula</th>
                      <th className="py-3 px-4">Prima Total</th>
                      <th className="py-3 px-4">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {recibos
                      .filter((r) =>
                        tableFilter
                          ? `${r.cnrecibo} ${r.cnpoliza} ${r.xasegurado} ${r.cidasegurado}`
                            .toLowerCase()
                            .includes(tableFilter.toLowerCase())
                          : true,
                      )
                      .map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-blue-700">
                            #{item.cnrecibo}
                          </td>
                          <td className="py-3 px-4 font-mono">{item.cnpoliza}</td>
                          <td className="py-3 px-4 font-medium uppercase">{item.xasegurado || '---'}</td>
                          <td className="py-3 px-4 font-mono text-slate-500">{item.cidasegurado || '---'}</td>
                          <td className="py-3 px-4 font-semibold text-emerald-700">
                            {item.mprimatotal ? `$${Number(item.mprimatotal).toFixed(2)}` : '$0.00'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${item.iestadorec === 'P'
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
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 4: CLIENTES (Dedicated View) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'clientes' && (
          <div className="p-7 space-y-6 max-w-7xl w-full mx-auto animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#0f274a]">Directorio de Clientes</h2>
                    <p className="text-xs text-slate-400">Asegurados y titulares registrados en SIS2000</p>
                  </div>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={tableFilter}
                    onChange={(e) => setTableFilter(e.target.value)}
                    placeholder="Filtrar por cédula, nombre, correo..."
                    className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Cédula / RIF</th>
                      <th className="py-3 px-4">Nombre / Razón Social</th>
                      <th className="py-3 px-4">Correo</th>
                      <th className="py-3 px-4">Teléfono</th>
                      <th className="py-3 px-4">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {clientes
                      .filter((c) =>
                        tableFilter
                          ? `${c.cid} ${c.xcliente} ${c.xcorreo}`
                            .toLowerCase()
                            .includes(tableFilter.toLowerCase())
                          : true,
                      )
                      .map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">
                            {item.cid || item.cci_rif}
                          </td>
                          <td className="py-3 px-4 font-medium uppercase">{item.xcliente || '---'}</td>
                          <td className="py-3 px-4 text-slate-600">{item.xcorreo || '---'}</td>
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {item.xtelefono_cel || item.xtelefono_hab || '---'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Activo
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f9]">
          <Loader2 className="w-8 h-8 animate-spin text-[#0f274a]" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
