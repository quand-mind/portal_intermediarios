'use client';

import React from 'react';
import {
  Bell,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { LoginResponse } from '@/lib/api';

interface DashboardHeaderProps {
  currentUser: LoginResponse['user'] | null;
  isLoadingData: boolean;
  onRefresh: () => void;
  getUserInitials: (name?: string) => string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentUser,
  isLoadingData,
  onRefresh,
  getUserInitials,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-7 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-semibold text-slate-700">La Mundial de Seguros</span>
        <span className="text-xs text-slate-400">&bull; Portal de Proveedores</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRefresh}
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
  );
};
