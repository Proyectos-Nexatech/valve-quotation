'use client';

import React, { useEffect, useState } from 'react';
import { Plus, List, TrendingUp, Clock, FileText, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: '0',
    inProcess: '0',
    sentThisMonth: '0',
    proyectado: '$0',
    enviado: '$0'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchRequests(),
      fetchStats()
    ]);
    setIsLoading(false);
  };

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('solicitudes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      const [pendingCount, inProcessCount, sentMonthCount, itemsResult, solicitudesResult] = await Promise.all([
        supabase.from('solicitudes').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
        supabase.from('solicitudes').select('*', { count: 'exact', head: true }).eq('estado', 'en_proceso'),
        supabase.from('solicitudes').select('*', { count: 'exact', head: true }).eq('estado', 'enviada').gte('created_at', startOfMonth),
        supabase.from('items_solicitud').select('*'),
        supabase.from('solicitudes').select('id, estado')
      ]);

      const getFallbackPrice = (type: string) => {
        const t = String(type || '').toLowerCase();
        if (t.includes('control')) return 1912500;
        if (t.includes('safety') || t.includes('seguridad')) return 1190000;
        return 850000;
      };

      // Mapa de estados de solicitudes
      const solEstadoMap: Record<string, string> = {};
      (solicitudesResult.data || []).forEach((s: any) => {
        solEstadoMap[s.id] = s.estado || 'pendiente';
      });

      // Calcular montos agrupados por estado
      let totalProyectado = 0;
      let totalEnviado = 0;

      (itemsResult.data || []).forEach((item: any) => {
        const estado = solEstadoMap[item.solicitud_id];
        if (!estado) return;

        const price = parseFloat(String(item.precio_unitario_cop || getFallbackPrice(item.tipo_valvula)));
        const qty = Number(item.cantidad || 1);
        const subtotal = price * qty;
        
        // El usuario quiere el TOTAL FINAL (incluyendo IVA del 19%)
        const totalConIva = subtotal * 1.19;

        if (estado === 'pendiente' || estado === 'en_proceso') {
          totalProyectado += totalConIva;
        } else if (estado === 'enviada' || estado === 'finalizada') {
          totalEnviado += totalConIva;
        }
      });

      const formatCurrency = (value: number) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
        return `$${value.toFixed(0)}`;
      };

      setStats({
        pending: String(pendingCount.count || 0).padStart(2, '0'),
        inProcess: String(inProcessCount.count || 0).padStart(2, '0'),
        sentThisMonth: String(sentMonthCount.count || 0).padStart(2, '0'),
        proyectado: formatCurrency(totalProyectado),
        enviado: formatCurrency(totalEnviado)
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const STAT_CONFIG = [
    { label: 'Solicitudes Pendientes', value: stats.pending, icon: <Clock size={20} />, color: '#F59E0B' },
    { label: 'Enviadas este Mes', value: stats.sentThisMonth, icon: <FileText size={20} />, color: '#10B981' },
    { label: 'Valor Proyectado', value: stats.proyectado, icon: <TrendingUp size={20} />, color: '#3B82F6' },
    { label: 'Valor Enviado', value: stats.enviado, icon: <TrendingUp size={20} />, color: 'var(--color-midnight)' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
       {/* Header */}
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
             <h1 className="display-font" style={{ fontSize: '2.5rem', color: 'var(--color-midnight)', marginBottom: '0.5rem' }}>Dashboard Principal</h1>
             <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>Bienvenido de nuevo, Administrador.</p>
          </div>
          <Link href="/solicitudes" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             Ver Todas las Solicitudes <List size={18} />
          </Link>
       </div>

       {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
           {STAT_CONFIG.map((stat, idx) => (
             <div key={idx} style={{ 
                backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-sm)', 
                boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-surface-high)',
                display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center'
             }}>
                <div style={{ 
                   width: '48px', height: '48px', backgroundColor: 'var(--color-surface-low)', 
                   borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                   color: stat.color 
                }}>
                  {stat.icon}
                </div>
                <div style={{ flex: 1 }}>
                   <p style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>{stat.label.toUpperCase()}</p>
                   {isLoading ? (
                     <div style={{ height: '1.5rem', width: '3rem', backgroundColor: '#f1f5f9', borderRadius: '4px' }} className="animate-pulse" />
                   ) : (
                     <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-midnight)' }}>{stat.value}</p>
                   )}
                </div>
             </div>
           ))}
        </div>

       {/* Recent Requests Table */}
       <div style={{ 
          backgroundColor: 'white', padding: '2.5rem', borderRadius: 'var(--radius-sm)', 
          boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-surface-high)'
       }}>
          <h2 className="display-font" style={{ fontSize: '1.25rem', color: 'var(--color-midnight)', marginBottom: '2.5rem' }}>Solicitudes Recientes</h2>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
               <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-surface-high)' }}>
                  <th style={{ padding: '1rem', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>CÓDIGO</th>
                  <th style={{ padding: '1rem', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>CLIENTE / EMPRESA</th>
                  <th style={{ padding: '1rem', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>FECHA</th>
                  <th style={{ padding: '1rem', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>PRIORIDAD</th>
                  <th style={{ padding: '1rem', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>ESTADO</th>
                  <th style={{ padding: '1rem', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>ACCIÓN</th>
               </tr>
            </thead>
            <tbody>
               {isLoading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
                       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                          <Loader2 className="animate-spin" size={24} />
                          <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Cargando solicitudes...</p>
                       </div>
                    </td>
                  </tr>
               ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
                       <p style={{ fontSize: '0.875rem' }}>No hay solicitudes recientes.</p>
                    </td>
                  </tr>
               ) : (
                 requests.map((req, idx) => (
                   <tr key={req.id} style={{ borderBottom: '1px solid var(--color-surface-low)' }}>
                      <td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-midnight)' }}>{req.folio}</td>
                      <td style={{ padding: '1.5rem 1rem' }}>
                         <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-midnight)' }}>{req.cliente_nombre}</p>
                         <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>{req.cliente_empresa}</p>
                      </td>
                      <td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>
                        {new Date(req.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '1.5rem 1rem' }}>
                         <span style={{ 
                           fontSize: '0.625rem', padding: '0.25rem 0.75rem', borderRadius: '4px',
                           backgroundColor: req.prioridad === 'Urgente' ? '#FEE2E2' : '#EFF6FF',
                           color: req.prioridad === 'Urgente' ? '#EF4444' : '#3B82F6',
                           fontWeight: 700, fontFamily: 'var(--font-mono)'
                         }}>{(req.prioridad || 'NORMAL').toUpperCase()}</span>
                      </td>
                      <td style={{ padding: '1.5rem 1rem' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-midnight)' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: req.estado === 'pendiente' ? '#F59E0B' : '#10B981' }} />
                            {(req.estado || 'Recibido').toUpperCase()}
                         </div>
                      </td>
                      <td style={{ padding: '1.5rem 1rem' }}>
                         <Link href={`/solicitudes/${req.id}`} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-orange)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            REVISAR <ArrowRight size={14} />
                         </Link>
                      </td>
                   </tr>
                 ))
               )}
            </tbody>
          </table>
       </div>
    </div>
  );
}
