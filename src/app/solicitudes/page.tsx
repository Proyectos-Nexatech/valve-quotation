'use client';

import React, { useEffect, useState } from 'react';
import { 
  Search, Filter, Calendar, ChevronRight, 
  Clock, CheckCircle2, AlertCircle, Loader2, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Categorías de estados para filtros
const STATUS_FILTERS = [
  { id: 'all', label: 'Todas', count: '0' },
  { id: 'pendiente', label: 'Pendientes', color: '#F59E0B' },
  { id: 'en_proceso', label: 'En Proceso', color: '#3B82F6' },
  { id: 'enviada', label: 'Enviadas', color: '#10B981' },
];

export default function SolicitudesHistoryPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    // Aplicar filtros locales cuando cambia la lista, el filtro activo o el término de búsqueda
    let result = requests;

    if (activeFilter !== 'all') {
      result = result.filter(req => (req.estado || 'pendiente') === activeFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(req => 
        req.folio?.toLowerCase().includes(term) || 
        req.cliente_nombre?.toLowerCase().includes(term) ||
        req.cliente_empresa?.toLowerCase().includes(term)
      );
    }

    setFilteredRequests(result);
  }, [activeFilter, searchTerm, requests]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('solicitudes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
       {/* Page Header */}
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
             <h1 className="display-font" style={{ fontSize: '2.25rem', color: 'var(--color-midnight)', marginBottom: '0.5rem' }}>Historial de Solicitudes</h1>
             <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>Gestiona y monitorea todas las cotizaciones industriales recibidas.</p>
          </div>
       </div>

       {/* Toolbar: Search & Filters */}
       <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-high)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
             <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-variant)' }} size={18} />
             <input 
               type="text" 
               placeholder="Buscar por folio, cliente o empresa..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               style={{ 
                 width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: 'var(--radius-sm)', 
                 border: '1px solid var(--color-surface-high)', outline: 'none', fontSize: '0.875rem' 
               }}
             />
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', borderLeft: '1px solid var(--color-surface-high)', paddingLeft: '1rem' }}>
             {STATUS_FILTERS.map(filter => (
               <button 
                 key={filter.id}
                 onClick={() => setActiveFilter(filter.id)}
                 style={{ 
                   padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                   transition: 'all 0.2s', border: '1px solid transparent',
                   backgroundColor: activeFilter === filter.id ? 'var(--color-midnight)' : 'var(--color-surface-low)',
                   color: activeFilter === filter.id ? 'white' : 'var(--color-on-surface-variant)'
                 }}
               >
                 {filter.label}
               </button>
             ))}
          </div>
       </div>

       {/* Main Content: Table */}
       <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-high)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
             <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-surface-high)', backgroundColor: '#F8FAFC' }}>
                   <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>FOLIO</th>
                   <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>CLIENTE / EMPRESA</th>
                   <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>FECHA</th>
                   <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>PRIORIDAD</th>
                   <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>ESTADO</th>
                   <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>ACCIONES</th>
                </tr>
             </thead>
             <tbody>
                {isLoading ? (
                   <tr>
                      <td colSpan={6} style={{ padding: '6rem', textAlign: 'center' }}>
                         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <Loader2 className="animate-spin" size={32} color="var(--color-midnight)" />
                            <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>Cargando solicitudes...</p>
                         </div>
                      </td>
                   </tr>
                ) : filteredRequests.length === 0 ? (
                   <tr>
                      <td colSpan={6} style={{ padding: '6rem', textAlign: 'center' }}>
                         <div style={{ opacity: 0.5 }}>
                            <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
                            <p style={{ fontWeight: 600 }}>No se encontraron solicitudes.</p>
                            <p style={{ fontSize: '0.75rem' }}>Prueba ajustando los filtros o el término de búsqueda.</p>
                         </div>
                      </td>
                   </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id} style={{ borderBottom: '1px solid var(--color-surface-low)', transition: 'background-color 0.2s' }} className="table-row-hover">
                       <td style={{ padding: '1.5rem', fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-midnight)' }}>{req.folio}</td>
                       <td style={{ padding: '1.5rem 1rem' }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-midnight)' }}>{req.cliente_nombre}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>{req.cliente_empresa}</p>
                       </td>
                       <td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={14} />
                            {new Date(req.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                       </td>
                       <td style={{ padding: '1.5rem 1rem' }}>
                          <span style={{ 
                            fontSize: '0.625rem', padding: '0.25rem 0.75rem', borderRadius: '4px',
                            backgroundColor: req.prioridad === 'Urgente' ? '#FEE2E2' : '#EFF6FF',
                            color: req.prioridad === 'Urgente' ? '#EF4444' : '#3B82F6',
                            fontWeight: 800, letterSpacing: '0.05em'
                          }}>{(req.prioridad || 'NORMAL').toUpperCase()}</span>
                       </td>
                       <td style={{ padding: '1.5rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-midnight)' }}>
                             <span style={{ 
                               width: '10px', height: '10px', borderRadius: '50%', 
                               backgroundColor: (req.estado === 'pendiente' || !req.estado) ? '#F59E0B' : 
                                               req.estado === 'en_proceso' ? '#3B82F6' : '#10B981'
                             }} />
                             {((req.estado || 'pendiente').replace('_', ' ')).toUpperCase()}
                          </div>
                       </td>
                       <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                          <Link 
                            href={`/solicitudes/${req.id}`} 
                            style={{ 
                              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                              padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', 
                              backgroundColor: 'var(--color-midnight)', color: 'white',
                              fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none'
                            }}
                          >
                            REVISAR <ArrowUpRight size={14} />
                          </Link>
                       </td>
                    </tr>
                  ))
                )}
             </tbody>
          </table>
       </div>

       <style jsx>{`
         .table-row-hover:hover {
           background-color: #F8FAFC;
         }
       `}</style>
    </div>
  );
}
