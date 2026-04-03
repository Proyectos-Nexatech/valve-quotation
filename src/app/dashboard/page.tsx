'use client';

import React, { useEffect, useState } from 'react';
import { Plus, List, TrendingUp, Clock, FileText, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const STATS = [
  { label: 'Solicitudes Pendientes', value: '14', icon: <Clock size={20} />, color: '#F59E0B' },
  { label: 'Cotizaciones en Proceso', value: '08', icon: <TrendingUp size={20} />, color: '#3B82F6' },
  { label: 'Enviadas este Mes', value: '42', icon: <FileText size={20} />, color: '#10B981' },
  { label: 'Valor del Pipeline', value: '$12.4M', icon: <TrendingUp size={20} />, color: 'var(--color-midnight)' },
];

export default function DashboardPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('solicitudes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setIsLoading(false);
    }
  };
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
          {STATS.map((stat, idx) => (
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
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-midnight)' }}>{stat.value}</p>
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
