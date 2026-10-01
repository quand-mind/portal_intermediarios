'use client';

import React, { useState } from 'react';
import {
  Layers,
  HeartPulse,
  Search,
  Loader2,
  FileCheck,
  UserCheck,
  UserX,
} from 'lucide-react';
import { proveedorApi, LoginResponse } from '@/lib/api';
import { PolizaRecord, formatDate } from './types';

interface AsegurabilidadTabProps {
  currentUser: LoginResponse['user'] | null;
}

export const AsegurabilidadTab: React.FC<AsegurabilidadTabProps> = ({ currentUser }) => {
  const [asegurabilidadSearch, setAsegurabilidadSearch] = useState('');
  const [asegurabilidadResults, setAsegurabilidadResults] = useState<PolizaRecord[] | null>(null);
  const [isSearchingAseg, setIsSearchingAseg] = useState(false);
  const [hasSearchedAseg, setHasSearchedAseg] = useState(false);

  const handleSearchAsegurabilidad = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!asegurabilidadSearch.trim()) return;

    setIsSearchingAseg(true);
    setHasSearchedAseg(true);
    try {
      const cciRif = currentUser?.cci_rif
        ? Number(currentUser.cci_rif)
        : currentUser?.xusuario
        ? Number(currentUser.xusuario)
        : undefined;

      const res = await proveedorApi.consultarAsegurabilidad(asegurabilidadSearch.trim(), cciRif);
      setAsegurabilidadResults(res.data || []);
    } catch (err) {
      console.error(err);
      setAsegurabilidadResults([]);
    } finally {
      setIsSearchingAseg(false);
    }
  };

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

      {/* Consultar Asegurabilidad Card */}
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
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                          isAsegurable
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
                          {formatDate(item.fdesde)}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[10px] block font-medium">
                          Vigencia Hasta:
                        </span>
                        <span className="font-mono font-semibold text-slate-800">
                          {item.fhasta ? formatDate(item.fhasta) : 'Indefinida'}
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
  );
};
