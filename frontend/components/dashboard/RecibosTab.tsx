'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Layers,
  Receipt,
  Search,
  Loader2,
  RefreshCw,
  FileCheck,
  AlertCircle,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
} from 'lucide-react';
import { proveedorApi, LoginResponse } from '@/lib/api';
import { ReciboRecord } from './types';

interface RecibosTabProps {
  currentUser?: LoginResponse['user'] | null;
  recibos?: ReciboRecord[];
  clientesCount?: number;
}

export const RecibosTab: React.FC<RecibosTabProps> = ({
  currentUser,
  recibos: initialRecibos,
  clientesCount = 0,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' | 'P' | 'C' | 'A'
  const [fdesdeFilter, setFdesdeFilter] = useState('');
  const [fhastaFilter, setFhastaFilter] = useState('');

  const [recibosList, setRecibosList] = useState<ReciboRecord[]>(initialRecibos || []);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchRecibos = useCallback(
    async (search = '', status = '', fdesde = '', fhasta = '') => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const cciRif = currentUser?.cci_rif
          ? Number(currentUser.cci_rif)
          : currentUser?.xusuario
          ? Number(currentUser.xusuario)
          : undefined;

        const res = await proveedorApi.getRecibos(
          100,
          cciRif,
          search.trim(),
          status.trim(),
          fdesde.trim(),
          fhasta.trim(),
        );

        if (res?.data) {
          setRecibosList(res.data);
        } else {
          setRecibosList([]);
        }
      } catch (err: unknown) {
        console.error('Error al consultar recibos:', err);
        const message = err instanceof Error ? err.message : 'Error al obtener la lista de recibos.';
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
        setHasLoaded(true);
      }
    },
    [currentUser],
  );

  // Consultar la API de recibos al cargar la pestaña
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) {
        await fetchRecibos('', '', '', '');
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [fetchRecibos]);

  const handleApplyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    fetchRecibos(searchInput, statusFilter, fdesdeFilter, fhastaFilter);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setStatusFilter('');
    setFdesdeFilter('');
    setFhastaFilter('');
    fetchRecibos('', '', '', '');
  };

  const handleQuickStatusFilter = (status: string) => {
    const nextStatus = statusFilter === status ? '' : status;
    setStatusFilter(nextStatus);
    fetchRecibos(searchInput, nextStatus, fdesdeFilter, fhastaFilter);
  };

  // Cálculos de totales y métricas de recibos obtenidos
  const summary = useMemo(() => {
    let totalMonto = 0;
    let pendientesCount = 0;
    let pendientesMonto = 0;
    let cobradosCount = 0;
    let cobradosMonto = 0;
    let anuladosCount = 0;
    let anuladosMonto = 0;

    recibosList.forEach((r) => {
      const monto = Number(r.mprimatotal || 0);
      totalMonto += monto;

      const status = (r.iestadorec || '').toUpperCase();
      const statusDesc = (r.estatus_recibo || '').toLowerCase();

      if (status === 'P' || statusDesc === 'pendiente') {
        pendientesCount++;
        pendientesMonto += monto;
      } else if (status === 'C' || statusDesc === 'cobrado') {
        cobradosCount++;
        cobradosMonto += monto;
      } else if (status === 'A' || statusDesc === 'anulado') {
        anuladosCount++;
        anuladosMonto += monto;
      }
    });

    return {
      totalCount: recibosList.length,
      totalMonto,
      pendientesCount,
      pendientesMonto,
      cobradosCount,
      cobradosMonto,
      anuladosCount,
      anuladosMonto,
    };
  }, [recibosList]);

  return (
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

      {/* Consulta y Filtros de Recibos Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/70 space-y-5">
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
            Consulta y Filtros de Recibos
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Filtre recibos por rango de fechas de vigencia, estatus de cobro, número de póliza, recibo o datos del asegurado.
          </p>
        </div>

        <form onSubmit={handleApplyFilters} className="space-y-3 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Buscador de texto */}
            <div className="md:col-span-5 relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar por Nº Recibo, Póliza, Cédula o Asegurado..."
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 placeholder:text-slate-400 shadow-xs"
              />
            </div>

            {/* Selector de Estatus */}
            <div className="md:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 shadow-xs font-medium"
              >
                <option value="">Todos los Estatus</option>
                <option value="P">Pendientes (P)</option>
                <option value="C">Cobrados (C)</option>
                <option value="A">Anulados (A)</option>
              </select>
            </div>

            {/* Fecha Desde */}
            <div className="md:col-span-2 relative">
              <input
                type="date"
                value={fdesdeFilter}
                onChange={(e) => setFdesdeFilter(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 shadow-xs"
                title="Fecha Desde"
              />
            </div>

            {/* Fecha Hasta */}
            <div className="md:col-span-2 relative">
              <input
                type="date"
                value={fhastaFilter}
                onChange={(e) => setFhastaFilter(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 shadow-xs"
                title="Fecha Hasta"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filtro rápido de estatus:</span>
              <button
                type="button"
                onClick={() => handleQuickStatusFilter('P')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  statusFilter === 'P'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80'
                }`}
              >
                Pendientes ({summary.pendientesCount})
              </button>
              <button
                type="button"
                onClick={() => handleQuickStatusFilter('C')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  statusFilter === 'C'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80'
                }`}
              >
                Cobrados ({summary.cobradosCount})
              </button>
            </div>

            <div className="flex items-center gap-2">
              {(searchInput || statusFilter || fdesdeFilter || fhastaFilter) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  disabled={isLoading}
                  className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Limpiar filtros</span>
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="h-10 px-6 bg-[#0a1b33] hover:bg-[#163a6d] active:scale-[0.99] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[#0a1b33]/20 shrink-0 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Filtrando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Aplicar Filtros</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Listado de Recibos */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#0f274a] border-b-2 border-[#0f274a] pb-1 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Recibos Encontrados ({recibosList.length})</span>
            </span>
            {clientesCount > 0 && (
              <span className="text-xs font-semibold text-slate-400 px-2">
                Clientes ({clientesCount})
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => fetchRecibos(searchInput, statusFilter, fdesdeFilter, fhastaFilter)}
            disabled={isLoading}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Nº Recibo</th>
                <th className="py-3 px-4">Nº Póliza</th>
                <th className="py-3 px-4">Asegurado</th>
                <th className="py-3 px-4">Cédula / RIF</th>
                <th className="py-3 px-4">Plan / Cobertura</th>
                <th className="py-3 px-4">Vigencia Recibo</th>
                <th className="py-3 px-4">Monto Prima</th>
                <th className="py-3 px-4">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading && !hasLoaded ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <span className="text-xs font-medium">Cargando recibos...</span>
                  </td>
                </tr>
              ) : recibosList.length > 0 ? (
                recibosList.map((item, idx) => {
                  const isPendiente = item.iestadorec === 'P' || item.estatus_recibo?.toLowerCase() === 'pendiente';
                  const isCobrado = item.iestadorec === 'C' || item.estatus_recibo?.toLowerCase() === 'cobrado';
                  const isAnulado = item.iestadorec === 'A' || item.estatus_recibo?.toLowerCase() === 'anulado';

                  const fechaDesde = item.fdesderec || item.fdesde;
                  const fechaHasta = item.fhastarec || item.fhasta;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        #{item.cnrecibo}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {item.cnpoliza}
                      </td>
                      <td className="py-3 px-4 font-medium uppercase text-slate-800">
                        {item.xasegurado || '---'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 font-semibold">
                        {item.cidasegurado || '---'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.xplan || 'Riesgos Generales'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {fechaDesde ? new Date(fechaDesde).toLocaleDateString() : '---'}
                        {fechaHasta ? ` - ${new Date(fechaHasta).toLocaleDateString()}` : ''}
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-700 font-mono">
                        {item.mprimatotal ? `$${Number(item.mprimatotal).toFixed(2)}` : '$0.00'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                            isPendiente
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : isCobrado
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : isAnulado
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.estatus_recibo || (isPendiente ? 'Pendiente' : isCobrado ? 'Cobrado' : isAnulado ? 'Anulado' : item.iestadorec || '---')}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600 text-sm">
                      No se encontraron recibos
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {searchInput || statusFilter || fdesdeFilter || fhastaFilter
                        ? 'No hay registros que coincidan con los filtros seleccionados.'
                        : 'No hay recibos registrados para este proveedor.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUMMARY TOTALS CARDS (Below Table Data) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Recibos */}
        <div
          onClick={() => handleQuickStatusFilter('')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === ''
              ? 'bg-blue-50/60 border-blue-300 shadow-sm'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Recibos
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0f274a] mb-1">
            {summary.totalCount} <span className="text-xs font-semibold text-slate-500">recibos</span>
          </div>
          <div className="text-xs font-semibold text-slate-600 font-mono">
            Total: ${summary.totalMonto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Card 2: Pendientes */}
        <div
          onClick={() => handleQuickStatusFilter('P')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'P'
              ? 'bg-amber-50/80 border-amber-400 shadow-sm ring-2 ring-amber-400/20'
              : 'bg-white border-slate-200/80 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              Recibos Pendientes
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-900 mb-1">
            {summary.pendientesCount} <span className="text-xs font-semibold text-amber-700">pendientes</span>
          </div>
          <div className="text-xs font-bold text-amber-700 font-mono">
            Monto: ${summary.pendientesMonto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Card 3: Cobrados */}
        <div
          onClick={() => handleQuickStatusFilter('C')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'C'
              ? 'bg-emerald-50/80 border-emerald-400 shadow-sm ring-2 ring-emerald-400/20'
              : 'bg-white border-slate-200/80 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Recibos Cobrados
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-900 mb-1">
            {summary.cobradosCount} <span className="text-xs font-semibold text-emerald-700">cobrados</span>
          </div>
          <div className="text-xs font-bold text-emerald-700 font-mono">
            Monto: ${summary.cobradosMonto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Card 4: Monto Facturado */}
        <div className="p-5 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-900 to-[#0f274a] text-white shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Prima Total Obtenida
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 mb-1 font-mono">
            ${summary.totalMonto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400">
            Suma acumulada de recibos listados
          </div>
        </div>
      </div>
    </div>
  );
};
