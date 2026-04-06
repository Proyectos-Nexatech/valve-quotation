'use client';

import React, { useEffect, useState } from 'react';
import { 
  Search, Clock, CheckCircle2, AlertCircle, Loader2, ArrowUpRight, 
  List as ListIcon, Calendar as CalendarIcon, ChevronLeft, ChevronRight as ChevronRightIcon,
  X, Check
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Categorías de estados para filtros
const STATUS_FILTERS = [
  { id: 'all', label: 'Todas', count: '0' },
  { id: 'pendiente', label: 'Pendientes', color: '#F59E0B' },
  { id: 'en_proceso', label: 'En Proceso', color: '#3B82F6' },
  { id: 'enviada', label: 'Enviadas', color: '#10B981' },
  { id: 'adjudicada', label: 'Adjudicadas', color: 'var(--color-midnight)' },
];

export default function SolicitudesHistoryPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // New States
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateFilterMode, setDateFilterMode] = useState<'days' | 'months' | 'years'>('days');
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null, end: Date | null }>({
    start: null,
    end: null
  });
  
  // Calendar UI state
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let result = requests;

    // 1. Filter by Status
    if (activeFilter !== 'all') {
      result = result.filter(req => (req.estado || 'pendiente') === activeFilter);
    }

    // 2. Filter by Search Term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(req => 
        req.folio?.toLowerCase().includes(term) || 
        req.cliente_nombre?.toLowerCase().includes(term) ||
        req.cliente_empresa?.toLowerCase().includes(term)
      );
    }

    // 3. Filter by Date Range
    if (selectedRange.start) {
      result = result.filter(req => {
        const d = new Date(req.created_at);
        const start = new Date(selectedRange.start!);
        start.setHours(0,0,0,0);
        
        if (selectedRange.end) {
          const end = new Date(selectedRange.end);
          end.setHours(23,59,59,999);
          return d >= start && d <= end;
        }
        return d >= start;
      });
    }

    setFilteredRequests(result);
  }, [activeFilter, searchTerm, requests, selectedRange]);

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

        {/* Toolbar: Search & Premium Multi-Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', backgroundColor: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-high)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                 <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-variant)' }} size={18} />
                 <input 
                   type="text" 
                   placeholder="Buscar cotizaciones..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   style={{ 
                     width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: 'var(--radius-md)', 
                     border: '1px solid var(--color-surface-low)', outline: 'none', fontSize: '0.875rem' 
                   }}
                 />
              </div>
              
              <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--color-surface-low)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
                 {STATUS_FILTERS.map(filter => (
                   <button 
                     key={filter.id}
                     onClick={() => setActiveFilter(filter.id)}
                     style={{ 
                       padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700,
                       transition: 'all 0.2s', border: 'none',
                       backgroundColor: activeFilter === filter.id ? 'white' : 'transparent',
                       color: activeFilter === filter.id ? 'var(--color-midnight)' : 'var(--color-on-surface-variant)',
                       boxShadow: activeFilter === filter.id ? 'var(--shadow-sm)' : 'none'
                     }}
                   >
                     {filter.label.toUpperCase()}
                   </button>
                 ))}
              </div>

              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', 
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-high)',
                    fontSize: '0.75rem', fontWeight: 800, backgroundColor: 'white'
                  }}>
                  <CalendarIcon size={16} />
                  {selectedRange.start ? (
                    `${selectedRange.start.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })} ${selectedRange.end ? `→ ${selectedRange.end.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}` : ''}`
                  ) : 'FILTRAR FECHAS'}
                </button>

                {showDatePicker && (
                  <PremiumDatePicker 
                    mode={dateFilterMode}
                    setMode={setDateFilterMode}
                    onApply={(range: any) => { setSelectedRange(range); setShowDatePicker(false); }}
                    onClose={() => setShowDatePicker(false)}
                    currentRange={selectedRange}
                  />
                )}
              </div>

              <div style={{ display: 'flex', backgroundColor: 'var(--color-midnight)', borderRadius: 'var(--radius-sm)', padding: '0.25rem' }}>
                 <button 
                   onClick={() => setViewMode('list')}
                   style={{ padding: '0.5rem', borderRadius: '4px', backgroundColor: viewMode === 'list' ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
                   <ListIcon size={18} color="white" />
                 </button>
                 <button 
                   onClick={() => setViewMode('calendar')}
                   style={{ padding: '0.5rem', borderRadius: '4px', backgroundColor: viewMode === 'calendar' ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
                   <CalendarIcon size={18} color="white" />
                 </button>
              </div>
           </div>
        </div>

        {/* Dynamic Content */}
        {viewMode === 'list' ? (
           <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-high)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                 <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-surface-high)', backgroundColor: '#F9FAFB' }}>
                       <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.05em' }}>FOLIO</th>
                       <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.05em' }}>CLIENTE / ENTIDAD</th>
                       <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.05em' }}>FECHA DE CREACIÓN</th>
                       <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.05em' }}>PRIORIDAD</th>
                       <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.05em' }}>ESTADO</th>
                       <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.05em' }}>GESTIÓN</th>
                    </tr>
                 </thead>
                 <tbody>
                    {isLoading ? (
                       <tr><td colSpan={6} style={{ padding: '6rem', textAlign: 'center' }}><Loader2 className="animate-spin" size={32} color="var(--color-midnight)" /></td></tr>
                    ) : filteredRequests.length === 0 ? (
                       <tr><td colSpan={6} style={{ padding: '6rem', textAlign: 'center' }}><p style={{ fontWeight: 600 }}>No hay datos para este rango.</p></td></tr>
                    ) : (
                      filteredRequests.map((req) => (
                        <tr key={req.id} style={{ borderBottom: '1px solid var(--color-surface-low)' }} className="table-row-hover">
                           <td style={{ padding: '1.5rem', fontSize: '0.875rem', fontWeight: 900, color: 'black' }}>{req.folio}</td>
                           <td style={{ padding: '1.5rem 1rem' }}>
                              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-midnight)' }}>{req.cliente_nombre}</p>
                              <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>{req.cliente_empresa}</p>
                           </td>
                           <td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>
                              {new Date(req.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                           </td>
                           <td style={{ padding: '1.5rem 1rem' }}>
                              <span style={{ 
                                fontSize: '0.625rem', padding: '0.25rem 0.6rem', borderRadius: '4px',
                                backgroundColor: req.prioridad === 'Urgente' ? '#FEF2F2' : '#F0F9FF',
                                color: req.prioridad === 'Urgente' ? '#DC2626' : '#0369A1',
                                fontWeight: 900
                              }}>{(req.prioridad || 'NORMAL').toUpperCase()}</span>
                           </td>
                           <td style={{ padding: '1.5rem 1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 800 }}>
                                 <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: req.estado === 'pendiente' ? '#F59E0B' : req.estado === 'en_proceso' ? '#3B82F6' : req.estado === 'adjudicada' ? 'var(--color-midnight)' : '#10B981' }} />
                                 {((req.estado || 'Recibido').replace('_', ' ')).toUpperCase()}
                              </div>
                           </td>
                           <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                              <Link href={`/solicitudes/${req.id}`} style={{ padding: '0.5rem 1rem', borderRadius: '6px', backgroundColor: 'black', color: 'white', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>REVISAR</Link>
                           </td>
                        </tr>
                      ))
                    )}
                 </tbody>
              </table>
           </div>
        ) : (
           <CalendarView requests={filteredRequests} currentDate={currentCalendarDate} setCurrentDate={setCurrentCalendarDate} />
        )}

        <style jsx>{`
          .table-row-hover:hover { background-color: #FAFBFC; }
        `}</style>
     </div>
  );
}

// Sub-componente Premium Date Picker (Basado en la imagen)
function PremiumDatePicker({ mode, setMode, onApply, onClose, currentRange }: any) {
  const [localRange, setLocalRange] = useState(currentRange);
  const [viewDate, setViewDate] = useState(new Date());

  const quickFilters = [
    { label: 'Este mes', range: { start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), end: new Date() } },
    { label: 'Mes pasado', range: { start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), end: new Date(new Date().getFullYear(), new Date().getMonth(), 0) } },
    { label: 'Este año', range: { start: new Date(new Date().getFullYear(), 0, 1), end: new Date() } },
    { label: 'Últimos 7 días', range: { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() } }
  ];

  return (
    <div style={{ 
      position: 'absolute', top: '100%', right: 0, marginTop: '1rem', width: '600px',
      backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
      border: '1px solid var(--color-surface-high)', zIndex: 100, padding: '2rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
          {localRange.start ? localRange.start.toLocaleDateString('es-CO', { month: 'long', day: 'numeric' }) : 'Seleccionar'} 
          {localRange.end ? ` → ${localRange.end.toLocaleDateString('es-CO', { month: 'long', day: 'numeric' })}` : ''}
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={onClose} style={{ padding: '0.5rem 1.25rem', borderRadius: '12px', backgroundColor: '#F3F4F6', fontSize: '0.875rem' }}>Cerrar</button>
          <button onClick={() => onApply(localRange)} style={{ padding: '0.5rem 1.25rem', borderRadius: '12px', backgroundColor: 'black', color: 'white', fontSize: '0.875rem' }}>Aplicar</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.5rem' }}>
        {['days', 'months', 'years'].map(m => (
          <button 
            key={m} 
            onClick={() => setMode(m)}
            style={{ 
              fontSize: '0.875rem', fontWeight: 600, paddingBottom: '0.5rem',
              color: mode === m ? 'black' : '#9CA3AF',
              borderBottom: mode === m ? '2px solid black' : '2px solid transparent'
            }}>
            {m === 'days' ? 'Días' : m === 'months' ? 'Meses' : 'Años'}
          </button>
        ))}
      </div>

      {mode === 'days' && (
        <div style={{ display: 'flex', gap: '2rem' }}>
          <MonthSelector date={viewDate} onSelect={(d: Date) => setLocalRange({ ...localRange, start: d })} range={localRange} />
          <MonthSelector date={new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)} onSelect={(d: Date) => setLocalRange({ ...localRange, end: d })} range={localRange} />
        </div>
      )}

      {mode === 'months' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
          {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map((m, i) => (
            <button 
              key={m}
              onClick={() => setLocalRange({ start: new Date(2026, i, 1), end: new Date(2026, i + 1, 0) })}
              style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#F8F9FA', fontSize: '0.75rem', fontWeight: 600 }}
            >{m}</button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '2rem' }}>
        {quickFilters.map(f => (
          <button 
            key={f.label} 
            onClick={() => setLocalRange(f.range)}
            style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #E5E7EB', fontSize: '0.75rem', fontWeight: 600 }}>
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MonthSelector({ date, onSelect, range }: any) {
  const days = Array.from({ length: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() }, (_, i) => i + 1);
  const startEmpty = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  return (
    <div style={{ flex: 1 }}>
      <h4 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
        {date.toLocaleDateString('es-CO', { month: 'long' }).toUpperCase()}
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center' }}>
        {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(d => <div key={d} style={{ fontSize: '0.625rem', fontWeight: 600, color: '#9CA3AF' }}>{d}</div>)}
        {Array(startEmpty === 0 ? 6 : startEmpty - 1).fill(null).map((_, i) => <div key={i} />)}
        {days.map(d => {
          const current = new Date(date.getFullYear(), date.getMonth(), d);
          const isSelected = range.start?.getTime() === current.getTime() || range.end?.getTime() === current.getTime();
          return (
            <button 
              key={d} 
              onClick={() => onSelect(current)}
              style={{ 
                width: '32px', height: '32px', borderRadius: '50%', border: 'none', fontSize: '0.75rem', fontWeight: 600,
                backgroundColor: isSelected ? 'black' : 'transparent', color: isSelected ? 'white' : 'black'
              }}>{d}</button>
          );
        })}
      </div>
    </div>
  );
}

// Sub-componente para la Vista de Calendario
function CalendarView({ requests, currentDate, setCurrentDate }: { requests: any[], currentDate: Date, setCurrentDate: (d: Date) => void }) {
  const monthNames = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  
  const calendarDays = [];
  // Celdas vacías para el inicio del mes
  for (let i = 0; i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); i++) {
    calendarDays.push(null);
  }
  // Días del mes
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const getRequestsForDay = (day: number) => {
    return requests.filter(req => {
      const d = new Date(req.created_at);
      return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-high)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-surface-high)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="display-font" style={{ fontSize: '1rem', color: 'var(--color-midnight)' }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handlePrevMonth} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--color-surface-high)', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
          <button onClick={handleNextMonth} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--color-surface-high)', cursor: 'pointer' }}><ChevronRightIcon size={16} /></button>
        </div>
      </div>

      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        borderBottom: '1px solid var(--color-surface-high)',
        backgroundColor: '#F8FAFC'
      }}>
        {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(d => (
          <div key={d} style={{ padding: '0.75rem', fontSize: '0.625rem', fontWeight: 800, textAlign: 'center', color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#E2E8F0', gap: '1px' }}>
        {calendarDays.map((day, idx) => {
          const dayRequests = day ? getRequestsForDay(day) : [];
          return (
            <div key={idx} style={{ 
              backgroundColor: 'white', minHeight: '130px', padding: '0.75rem',
              display: 'flex', flexDirection: 'column', gap: '0.5rem'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, opacity: day ? 1 : 0, color: 'var(--color-on-surface-variant)' }}>{day}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {dayRequests.map(req => (
                  <Link key={req.id} href={`/solicitudes/${req.id}`} style={{ 
                    fontSize: '0.625rem', padding: '0.4rem', borderRadius: '6px', 
                    textDecoration: 'none', color: 'white', fontWeight: 800,
                    backgroundColor: req.estado === 'pendiente' ? '#F59E0B' : req.estado === 'en_proceso' ? '#3B82F6' : req.estado === 'adjudicada' ? 'var(--color-midnight)' : '#10B981',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {req.folio}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
