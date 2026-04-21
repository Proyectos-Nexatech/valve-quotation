'use client';

import React, { useEffect, useState } from 'react';
import { 
  FileText, Search, Download, Send, 
  CheckCircle2, Clock, Loader2, Filter, Mail, ExternalLink,
  ChevronRight, AlertCircle, List as ListIcon, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight as ChevronRightIcon, X, Check, Activity
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const VALVE_LABELS: Record<string, string> = {
  'manual': 'Válvula Manual',
  'safety': 'Válvula de Seguridad',
  'pressure-vacuum': 'Válvula Presión-Vacío',
  'on-off': 'Válvula On/Off',
  'control': 'Válvula de Control'
};

export default function CotizacionesListPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Layout & Filter States (Sync with Solicitudes)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateFilterMode, setDateFilterMode] = useState<'days' | 'months' | 'years'>('days');
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null, end: Date | null }>({
    start: null,
    end: null
  });
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    let result = quotations;

    // 1. Filter by Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(q => 
        q.folio?.toLowerCase().includes(term) || 
        q.cliente_nombre?.toLowerCase().includes(term) ||
        q.cliente_empresa?.toLowerCase().includes(term)
      );
    }

    // 2. Filter by Date Range (Sync with Solicitudes)
    if (selectedRange.start) {
      result = result.filter(q => {
        const d = new Date(q.created_at);
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

    setFilteredDocs(result);
  }, [searchTerm, quotations, selectedRange]);

  const fetchQuotations = async () => {
    try {
      const { data, error } = await supabase
        .from('solicitudes')
        .select('*')
        .in('estado', ['finalizada', 'enviada', 'adjudicada'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotations(data || []);
    } catch (err) {
      console.error('Error fetching quotations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsSent = async (id: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('solicitudes')
        .update({ estado: 'enviada' })
        .eq('id', id);

      if (error) throw error;
      setQuotations(quotations.map(q => q.id === id ? { ...q, estado: 'enviada' } : q));
    } catch (err) {
      console.error('Error actualizando estado:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const markAsAwarded = async (id: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('solicitudes')
        .update({ estado: 'adjudicada' })
        .eq('id', id);

      if (error) throw error;
      setQuotations(quotations.map(q => q.id === id ? { ...q, estado: 'adjudicada' } : q));
    } catch (err) {
      console.error('Error actualizando estado:', err);
      alert('Error al marcar como adjudicada.');
    } finally {
      setUpdatingId(null);
    }
  };

  const parseIndustrialSize = (str: string): number => {
    if (!str) return 0;
    let clean = str.replace(/"/g, '').trim().toLowerCase();
    const parts = clean.split(/[\s-]+/);
    let total = 0;
    for (const p of parts) {
      if (p.includes('/')) {
        const subParts = p.split(/[\-]+/);
        if (subParts.length > 1) {
           total += parseFloat(subParts[0]);
           const [num, den] = subParts[1].split('/').map(Number);
           if (den) total += num / den;
        } else {
           const [num, den] = p.split('/').map(Number);
           if (den) total += num / den;
        }
      } else {
        const val = parseFloat(p);
        if (!isNaN(val)) total += val;
      }
    }
    return total;
  };

  const decodeRange = (rawStr: string): { min: number, max: number } | null => {
    const str = rawStr.replace(/"/g, '').trim().toLowerCase();
    if (str.includes('hasta')) {
      const parts = str.split('hasta');
      return { min: parseIndustrialSize(parts[0]), max: parseIndustrialSize(parts[1]) };
    }
    if (str.includes(' - ')) {
       const parts = str.split(' - ');
       return { min: parseIndustrialSize(parts[0]), max: parseIndustrialSize(parts[1]) };
    }
    if (str.includes('-')) {
       const parts = str.split('-');
       if (parts.length === 3) {
          return { min: parseIndustrialSize(parts[0]), max: parseIndustrialSize(parts[1] + '-' + parts[2]) };
       }
       return { min: parseIndustrialSize(parts[0]), max: parseIndustrialSize(parts[parts.length-1]) };
    }
    return null;
  };

  const downloadPDF = async (request: any) => {
    setDownloadingId(request.id);
    try {
      const [{ data: items }, { data: catalogItems }, { data: config }] = await Promise.all([
        supabase.from('items_solicitud').select('*').eq('solicitud_id', request.id),
        supabase.from('tarifario').select('*'),
        supabase.from('configuracion_global').select('*').eq('id', 1).single()
      ]);

      if (!items || !catalogItems || !config) throw new Error("Datos incompletos");

      const enrichedItems = items.map(item => {
        let specs = item.especificaciones;
        if (typeof specs === 'string') {
          try { specs = JSON.parse(specs); } catch (e) { specs = {}; }
        }

        const itemSizeNum = parseIndustrialSize(specs?.nominalSize);
        const itemRatingNum = parseFloat(specs?.rating?.toString().replace(/[^0-9.]/g, '') || '0');

        const potentialMatches = catalogItems.filter(c => {
          const typeMap: Record<string, string> = { 
            'manual': 'manual', 
            'safety': 'seguridad', 
            'on-off': 'on', 
            'control': 'control',
            'pressure-vacuum': 'presión'
          };
          const catType = (c.tipo_valvula || '').toLowerCase();
          const itemType = typeMap[item.tipo_valvula] || item.tipo_valvula;
          if (!catType.includes(itemType)) return false;

          let sameSize = false;
          const range = decodeRange(c.tamano || '');
          if (range) {
             sameSize = (itemSizeNum >= range.min && itemSizeNum <= range.max);
          } else {
             sameSize = parseIndustrialSize(c.tamano) === itemSizeNum;
          }
          if (!sameSize) return false;

          let sameRating = false;
          const rawRating = (c.rating || '').toString().toLowerCase();
          if (rawRating.includes('-') || rawRating.includes(',')) {
             const parts = rawRating.split(/[\s\-,/]+/);
             const ratings = parts.map((p: string) => parseFloat(p.replace(/[^0-9.]/g, '')));
             const min = Math.min(...ratings);
             const max = Math.max(...ratings);
             sameRating = (itemRatingNum >= min && itemRatingNum <= max) || ratings.includes(itemRatingNum);
          } else {
             sameRating = parseFloat(rawRating.replace(/[^0-9.]/g, '')) === itemRatingNum;
          }
          return sameRating;
        });

        const itemServ = (item.servicio || '').toLowerCase();
        const serviceMatch = potentialMatches.find(c => {
           const catServ = (c.servicio || '').toLowerCase();
           const isMaint = itemServ.includes('mantenimiento') && (catServ.includes('mantenimiento') || catServ.includes('reparación'));
           const isCert = (itemServ.includes('certifica') || itemServ.includes('prueba')) && (catServ.includes('certifica') || catServ.includes('prueba'));
           return isMaint || isCert || catServ.includes(itemServ) || itemServ.includes(catServ);
        });

        const match = serviceMatch || potentialMatches[0];
        const finalPrice = item.precio_unitario_cop || (match ? match.costo_base : 850000);
        const finalDur = item.duracion || (match ? match.duracion : 0);

        return { ...item, especificaciones: specs, precio_unitario_cop: finalPrice, duracion: finalDur };
      });

      const doc = new jsPDF();
      
      if (config.logo_url) {
        try { doc.addImage(config.logo_url, 'PNG', 20, 15, 35, 35); } catch (e) { console.error(e); }
      }

      doc.setFontSize(18);
      doc.setTextColor(20, 20, 20);
      doc.setFont('helvetica', 'bold');
      doc.text(config.razon_social || 'Bustillo Ingenieria SAS', 65, 30);
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text(`NIT: ${config.nit || '900.XXX.XXX-X'}`, 65, 37);
      
      doc.setFontSize(14);
      doc.setTextColor(239, 68, 68);
      doc.setFont('helvetica', 'bold');
      doc.text(`COTIZACIÓN: ${request.folio}`, 65, 45);
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text(`${config.direccion || ''}, ${config.ciudad || 'Cartagena, Colombia'}`, 65, 52);
      doc.text(`Tel: ${config.telefono_contacto || ''} | Email: ${config.email_contacto || ''}`, 65, 57);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('RECIBIDO DE:', 20, 75);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`${request.cliente_nombre}`, 20, 82);
      doc.text(`${request.cliente_empresa} - NIT: ${request.cliente_nit || 'N/A'}`, 20, 87);
      doc.text(`Tel: ${request.cliente_telefono} | Email: ${request.cliente_email}`, 20, 92);
      
      doc.text(`Fecha: ${new Date(request.created_at).toLocaleDateString()}`, 145, 75);
      doc.text(`Prioridad: ${request.prioridad || 'Normal'}`, 145, 80);

      const subtotal = enrichedItems.reduce((acc, i) => acc + (i.precio_unitario_cop * i.cantidad), 0);
      const iva = subtotal * 0.19;
      const totalFinal = subtotal + iva;

      const tableData = enrichedItems.map((item, index) => [
        (index + 1).toString().padStart(2, '0'),
        item.cantidad.toString(),
        `${VALVE_LABELS[item.tipo_valvula] || item.tipo_valvula} ${item.especificaciones?.nominalSize || ''} ${item.especificaciones?.rating || ''}\n(${item.servicio})${item.especificaciones?.montajeDesmontaje ? ' + Montaje/Desmontaje' : ''}`,
        `$ ${Math.round(item.precio_unitario_cop).toLocaleString()}`,
        `$ ${Math.round(item.precio_unitario_cop * item.cantidad).toLocaleString()}`
      ]);

      const totalHours = enrichedItems.reduce((acc, item) => acc + (item.duracion * item.cantidad), 0);
      const totalDays = Math.ceil(totalHours / 8);

      autoTable(doc, {
        startY: 100,
        head: [['ÍTEM', 'CANT', 'ESPECIFICACIONES TÉCNICAS', 'P. UNITARIO', 'SUBTOTAL']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [40, 40, 40], fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8 },
        margin: { left: 20, right: 20 }
      });

      let currentY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('DURACIÓN ESTIMADA:', 110, currentY);
      doc.text(`${totalDays} DÍAS (8h/turno)`, 160, currentY);

      currentY += 10;
      doc.setFontSize(9);
      doc.text('SUBTOTAL:', 110, currentY);
      doc.text(`$ ${Math.round(subtotal).toLocaleString()}`, 160, currentY);

      currentY += 7;
      doc.text('IVA (19%):', 110, currentY);
      doc.text(`$ ${Math.round(iva).toLocaleString()}`, 160, currentY);

      currentY += 10;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('TOTAL DE LA PROPUESTA (COP):', 110, currentY);
      currentY += 10;
      doc.setFontSize(16);
      doc.text(`$ ${Math.round(totalFinal).toLocaleString()}`, 145, currentY); 

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const splitTerms = doc.splitTextToSize(config.terminos_condiciones || 'Esta cotización tiene una validez de 30 días.', 170);
      doc.text(splitTerms, 105, 275, { align: 'center' });

      doc.save(`${request.folio}_cotizacion.pdf`);
    } catch (err) {
      console.error('Error:', err);
      alert('Error al generar PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', width: '100%' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
             <h1 className="display-font" style={{ fontSize: '2.25rem', color: 'var(--color-midnight)', marginBottom: '0.5rem' }}>Cotizaciones Generadas</h1>
             <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem', fontWeight: 500 }}>
                Repositorio de documentos técnicos listos para envío y seguimiento comercial.
             </p>
          </div>
       </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', backgroundColor: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-high)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                 <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-variant)' }} size={18} />
                 <input 
                   type="text" 
                   placeholder="Buscar en el repositorio comercial..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   style={{ 
                     width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: 'var(--radius-md)', 
                     border: '1px solid var(--color-surface-low)', outline: 'none', fontSize: '0.875rem' 
                   }}
                 />
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
                  ) : 'FILTRAR POR FECHA'}
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

        {viewMode === 'list' ? (
           <div style={{ 
              backgroundColor: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-high)', 
              boxShadow: 'var(--shadow-md)', overflow: 'hidden' 
           }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                 <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-surface-high)', backgroundColor: '#F9FAFB' }}>
                       <th style={{ padding: '1.25rem 2.5rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em' }}>FOLIO / DOC</th>
                       <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em' }}>CLIENTE</th>
                       <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em' }}>FECHA DE EMISIÓN</th>
                       <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em' }}>ESTADO</th>
                       <th style={{ padding: '1.25rem 2.5rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em' }}>GESTIÓN COMERCIAL</th>
                    </tr>
                 </thead>
                 <tbody>
                    {isLoading ? (
                       <tr><td colSpan={5} style={{ padding: '8rem', textAlign: 'center' }}><Loader2 className="animate-spin" size={40} color="var(--color-midnight)" /></td></tr>
                    ) : filteredDocs.length === 0 ? (
                       <tr><td colSpan={5} style={{ padding: '8rem', textAlign: 'center' }}><p style={{ fontWeight: 800, opacity: 0.5 }}>No hay cotizaciones para este rango.</p></td></tr>
                    ) : (
                      filteredDocs.map(q => (
                        <tr key={q.id} style={{ borderBottom: '1px solid #F1F5F9' }} className="row-hover">
                           <td style={{ padding: '2rem 2.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                 <div style={{ padding: '0.5rem', backgroundColor: '#FEE2E2', color: '#EF4444', borderRadius: '4px' }}>
                                    <FileText size={20} />
                                 </div>
                                 <div>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 900 }}>{q.folio}</p>
                                    <p style={{ fontSize: '0.625rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>DOCUMENTO PDF</p>
                                 </div>
                              </div>
                           </td>
                           <td style={{ padding: '2rem 1rem' }}>
                              <p style={{ fontSize: '0.875rem', fontWeight: 800 }}>{q.cliente_nombre}</p>
                              <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>{q.cliente_empresa}</p>
                           </td>
                           <td style={{ padding: '2rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>
                              {new Date(q.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                           </td>
                           <td style={{ padding: '2rem 1rem' }}>
                              <span style={{ 
                                padding: '0.4rem 1rem', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 900,
                                backgroundColor: q.estado === 'adjudicada' ? 'var(--color-midnight)' : q.estado === 'enviada' ? '#E0F2FE' : '#D1FAE5',
                                color: q.estado === 'adjudicada' ? 'white' : q.estado === 'enviada' ? '#0369A1' : '#047857'
                              }}>{q.estado === 'adjudicada' ? 'ADJUDICADA' : q.estado === 'enviada' ? 'ENVIADA' : 'GENERADA'}</span>
                           </td>
                           <td style={{ padding: '2rem 2.5rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                 <button onClick={() => downloadPDF(q)} disabled={downloadingId === q.id} className="btn" style={{ padding: '0.6rem', border: '1.5px solid #E2E8F0', color: 'var(--color-midnight)', borderRadius: '4px' }}>
                                    {downloadingId === q.id ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                                 </button>
                                 <Link href={`/solicitudes/${q.id}`} style={{ padding: '0.6rem 1.2rem', border: '1.5px solid var(--color-midnight)', color: 'var(--color-midnight)', fontSize: '0.7rem', fontWeight: 800, textDecoration: 'none', borderRadius: '4px' }}>DETALLES</Link>
                                 
                                 {q.estado === 'finalizada' && (
                                   <button onClick={() => markAsSent(q.id)} disabled={updatingId === q.id} style={{ padding: '0.6rem 1.5rem', backgroundColor: 'black', color: 'white', fontSize: '0.7rem', fontWeight: 900, borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                                      {updatingId === q.id ? <Loader2 className="animate-spin" size={14} /> : 'ENVIAR AL CLIENTE'}
                                    </button>
                                 )}

                                 {q.estado === 'enviada' && (
                                   <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10B981', fontSize: '0.7rem', fontWeight: 900, padding: '0.6rem 0.5rem' }}>
                                         <CheckCircle2 size={16} /> ENVIADA
                                      </div>
                                      <button onClick={() => markAsAwarded(q.id)} disabled={updatingId === q.id} style={{ padding: '0.6rem 1rem', backgroundColor: 'var(--color-orange)', color: 'white', fontSize: '0.7rem', fontWeight: 900, borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                                         {updatingId === q.id ? <Loader2 className="animate-spin" size={14} /> : 'MARCAR ADJUDICADA'}
                                      </button>
                                   </div>
                                 )}

                                 {q.estado === 'adjudicada' && (
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-midnight)', fontSize: '0.7rem', fontWeight: 900, padding: '0.6rem 1rem' }}>
                                      <Activity size={16} /> ADJUDICADA (CERRADA)
                                   </div>
                                 )}
                              </div>
                           </td>
                        </tr>
                      ))
                    )}
                 </tbody>
              </table>
           </div>
        ) : (
           <CalendarView requests={filteredDocs} currentDate={currentCalendarDate} setCurrentDate={setCurrentCalendarDate} />
        )}

       <style jsx>{`
         .row-hover:hover {
           background-color: #F8FAFC;
         }
       `}</style>
    </div>
  );
}

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
      backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
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
          <button key={m} onClick={() => setMode(m)} style={{ fontSize: '0.875rem', fontWeight: 600, paddingBottom: '0.5rem', color: mode === m ? 'black' : '#9CA3AF', borderBottom: mode === m ? '2px solid black' : '2px solid transparent' }}>
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
            <button key={m} onClick={() => setLocalRange({ start: new Date(2026, i, 1), end: new Date(2026, i + 1, 0) })} style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#F8F9FA', fontSize: '0.75rem', fontWeight: 600 }}>{m}</button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '2rem' }}>
        {quickFilters.map(f => ( <button key={f.label} onClick={() => setLocalRange(f.range)} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #E5E7EB', fontSize: '0.75rem', fontWeight: 600 }}> {f.label} </button> ))}
      </div>
    </div>
  );
}

function MonthSelector({ date, onSelect, range }: any) {
  const days = Array.from({ length: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() }, (_, i) => i + 1);
  const startEmpty = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return (
    <div style={{ flex: 1 }}>
      <h4 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>{date.toLocaleDateString('es-CO', { month: 'long' }).toUpperCase()}</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center' }}>
        {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(d => <div key={d} style={{ fontSize: '0.625rem', fontWeight: 600, color: '#9CA3AF' }}>{d}</div>)}
        {Array(startEmpty === 0 ? 6 : startEmpty - 1).fill(null).map((_, i) => <div key={i} />)}
        {days.map(d => {
          const current = new Date(date.getFullYear(), date.getMonth(), d);
          const isSelected = range.start?.getTime() === current.getTime() || range.end?.getTime() === current.getTime();
          return ( <button key={d} onClick={() => onSelect(current)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', fontSize: '0.75rem', fontWeight: 600, backgroundColor: isSelected ? 'black' : 'transparent', color: isSelected ? 'white' : 'black' }}>{d}</button> );
        })}
      </div>
    </div>
  );
}

function CalendarView({ requests, currentDate, setCurrentDate }: any) {
  const monthNames = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const calendarDays = [];
  for (let i = 0; i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); i++) { calendarDays.push(null); }
  for (let i = 1; i <= daysInMonth; i++) { calendarDays.push(i); }

  const getRequestsForDay = (day: number) => {
    return requests.filter((req: any) => {
      const d = new Date(req.created_at);
      return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-high)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-surface-high)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="display-font" style={{ fontSize: '1rem', color: 'var(--color-midnight)' }}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--color-surface-high)', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--color-surface-high)', cursor: 'pointer' }}><ChevronRightIcon size={16} /></button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--color-surface-high)', backgroundColor: '#F8FAFC' }}>
        {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(d => ( <div key={d} style={{ padding: '0.75rem', fontSize: '0.625rem', fontWeight: 800, textAlign: 'center', color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>{d}</div> ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#E2E8F0', gap: '1px' }}>
        {calendarDays.map((day, idx) => {
          const dayRequests = day ? getRequestsForDay(day) : [];
          return (
            <div key={idx} style={{ backgroundColor: 'white', minHeight: '130px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, opacity: day ? 1 : 0, color: 'var(--color-on-surface-variant)' }}>{day}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {dayRequests.map((req: any) => (
                  <Link key={req.id} href={`/solicitudes/${req.id}`} style={{ fontSize: '0.625rem', padding: '0.4rem', borderRadius: '6px', textDecoration: 'none', color: 'white', fontWeight: 800, backgroundColor: req.estado === 'enviada' ? '#3B82F6' : '#10B981', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
