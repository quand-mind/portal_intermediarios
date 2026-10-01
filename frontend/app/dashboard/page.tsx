'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { proveedorApi, LoginResponse } from '@/lib/api';
import {
  DashboardTab,
  DashboardMetrics,
  ReciboRecord,
  Sidebar,
  DashboardHeader,
  InicioTab,
  AsegurabilidadTab,
  RecibosTab,
} from '@/components/dashboard';

function DashboardContent() {
  const router = useRouter();

  // User state from localStorage loaded on client mount to avoid hydration mismatch
  const [currentUser, setCurrentUser] = useState<LoginResponse['user'] | null>(null);

  const [activeTab, setActiveTab] = useState<DashboardTab>('inicio');

  // Metrics and Data states
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    polizas: { total: 149, label: 'Pólizas Activas', status: 'En consulta activa' },
    recibos: { total: 187, label: 'Recibos Totales', status: 'Historial acumulado' },
    clientes: { total: 18, label: 'Asegurados / Clientes', status: 'Resolución favorable' },
    sistema: { status: 'En línea', sincronizacion: 'Sincronización activa con SIS2000', ambiente: 'LOCAL' },
  });

  const [recibos, setRecibos] = useState<ReciboRecord[]>([]);
  const [clientesCount, setClientesCount] = useState<number>(18);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [metricsRes, recibosRes, clientesRes] = await Promise.all([
        proveedorApi.getMetrics(),
        proveedorApi.getRecibos(20),
        proveedorApi.getClientes(20),
      ]);

      if (metricsRes?.data) setMetrics(metricsRes.data);
      if (recibosRes?.data) setRecibos(recibosRes.data);
      if (clientesRes?.data) setClientesCount(clientesRes.data?.length || 0);
    } catch (err) {
      console.error('Error loading dashboard data', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const savedUser = typeof window !== 'undefined' ? localStorage.getItem('portal_user') : null;
      if (savedUser && isMounted) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch {
          // ignore
        }
      }
      if (isMounted) {
        await loadDashboardData();
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, [loadDashboardData]);

  const handleLogout = () => {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_user');
    router.push('/');
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
      {/* LEFT SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metrics={metrics}
        currentUser={currentUser}
        onLogout={handleLogout}
        getUserInitials={getUserInitials}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <DashboardHeader
          currentUser={currentUser}
          isLoadingData={isLoadingData}
          onRefresh={loadDashboardData}
          getUserInitials={getUserInitials}
        />

        {/* TAB 1: INICIO (Dashboard Overview) */}
        {activeTab === 'inicio' && (
          <InicioTab
            currentUser={currentUser}
            metrics={metrics}
            recibos={recibos}
            onNavigate={setActiveTab}
            getUserInitials={getUserInitials}
          />
        )}

        {/* TAB 2: ASEGURABILIDAD (Dedicated View) */}
        {activeTab === 'asegurabilidad' && (
          <AsegurabilidadTab currentUser={currentUser} />
        )}

        {/* TAB 3: RECIBOS (Dedicated View) */}
        {activeTab === 'recibos' && (
          <RecibosTab
            currentUser={currentUser}
            recibos={recibos}
            clientesCount={clientesCount}
          />
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
