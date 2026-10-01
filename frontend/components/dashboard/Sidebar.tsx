'use client';

import React from 'react';
import {
  Building2,
  Receipt,
  HeartPulse,
  LogOut,
} from 'lucide-react';
import { LoginResponse } from '@/lib/api';
import { DashboardTab, DashboardMetrics } from './types';

interface SidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  metrics: DashboardMetrics;
  currentUser: LoginResponse['user'] | null;
  onLogout: () => void;
  getUserInitials: (name?: string) => string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  metrics,
  currentUser,
  onLogout,
  getUserInitials,
}) => {
  return (
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
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'inicio'
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
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'recibos'
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

          {/* Item 3: Asegurabilidad */}
          <button
            onClick={() => setActiveTab('asegurabilidad')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'asegurabilidad'
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
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-rose-900/40 hover:text-rose-300 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};
