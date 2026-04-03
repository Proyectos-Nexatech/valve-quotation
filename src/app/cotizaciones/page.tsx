'use client';

import React, { useEffect, useState } from 'react';
import { 
  FileText, Search, Download, Send, 
  CheckCircle2, Clock, Loader2, Filter, Mail, ExternalLink,
  ChevronRight, AlertCircle
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

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    const result = quotations.filter(q => 
      q.folio?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      q.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.cliente_empresa?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDocs(result);
  }, [searchTerm, quotations]);

  const fetchQuotations = async () => {
    try {
      const { data, error } = await supabase
        .from('solicitudes')
        .select('*')
        .in('estado', ['finalizada', 'enviada'])
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

  const downloadPDF = async (request: any) => {
    setDownloadingId(request.id);
    try {
      // 1. Obtener items
      const { data: items, error } = await supabase
        .from('items_solicitud')
        .select('*')
        .eq('solicitud_id', request.id);

      if (error) throw error;

      // 2. Generar PDF
      const doc = new jsPDF();
      
      // Header: Logo Text / Company Info
      doc.setFontSize(22);
      doc.setTextColor(20, 20, 20);
      doc.text('BUSTILLO INGENIERÍA S.A.S.', 20, 30);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('NIT: 900.234.567-9 | Calle 123 Industrial', 20, 38);
      
      doc.setFontSize(14);
      doc.setTextColor(239, 68, 68); // Red-ish for Folio
      doc.text(`COTIZACIÓN: ${request.folio}`, 140, 30);
      
      // Datos del Cliente
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('RECIBIDO DE:', 20, 55);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`${request.cliente_nombre}`, 20, 62);
      doc.text(`${request.cliente_empresa}`, 20, 67);
      doc.text(`Tel: ${request.cliente_telefono}`, 20, 72);
      
      // Info Cotización
      doc.text(`Fecha: ${new Date(request.created_at).toLocaleDateString()}`, 140, 55);
      doc.text(`Prioridad: ${request.prioridad || 'Normal'}`, 140, 60);

      // Tabla de Items
      const tableData = items?.map((item, index) => [
        (index + 1).toString().padStart(2, '0'),
        item.cantidad.toString(),
        `${VALVE_LABELS[item.tipo_valvula] || item.tipo_valvula} - ${item.especificaciones?.nominalSize} ${item.especificaciones?.rating}`,
        '$ 850.000', // Mock price for now
        `$ ${(850000 * item.cantidad).toLocaleString()}`
      ]) || [];

      autoTable(doc, {
        startY: 85,
        head: [['ÍTEM', 'CANT', 'ESPECIFICACIONES TÉCNICAS', 'P. UNITARIO', 'SUBTOTAL']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [40, 40, 40], fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8 },
        margin: { left: 20, right: 20 }
      });

      // Totales
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL DE LA PROPUESTA (COP):', 110, finalY);
      doc.setFontSize(16);
      doc.text('$ 15.172.500', 140, finalY + 10); // Mock final total for now matching your logic

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Propuesta técnica sujeta a términos y condiciones de Bustillo Ingeniería.', 105, 280, { align: 'center' });

      // Download
      doc.save(`${request.folio}_cotizacion.pdf`);

    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error al generar el PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
       {/* Header Section */}
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
             <h1 className="display-font" style={{ fontSize: '2.25rem', color: 'var(--color-midnight)', marginBottom: '0.5rem' }}>Cotizaciones Generadas</h1>
             <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem', fontWeight: 500 }}>
                Repositorio de documentos técnicos listos para envío y seguimiento comercial.
             </p>
          </div>
       </div>

       {/* Toolbar */}
       <div style={{ 
         display: 'flex', gap: '1.5rem', backgroundColor: 'white', padding: '1.5rem 2.5rem', 
         borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-high)', 
         alignItems: 'center', boxShadow: 'var(--shadow-sm)' 
       }}>
          <div style={{ position: 'relative', flex: 1 }}>
             <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
             <input 
               type="text" placeholder="Buscar por Folio, Cliente o NIT..." 
               value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
               style={{ 
                 width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', border: '1px solid #E2E8F0', 
                 borderRadius: '8px', fontSize: '0.875rem', outline: 'none' 
               }}
             />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid #E2E8F0', paddingLeft: '1.5rem' }}>
             <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.625rem', fontWeight: 800, opacity: 0.5 }}>RESUMEN</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 900 }}>{filteredDocs.length} DOCS</p>
             </div>
             <Filter size={20} color="var(--color-midnight)" />
          </div>
       </div>

       {/* List / Table */}
       <div style={{ 
          backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-high)', 
          boxShadow: 'var(--shadow-md)', overflow: 'hidden' 
       }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
             <thead style={{ backgroundColor: '#F8FAFC' }}>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-surface-high)' }}>
                   <th style={{ padding: '1.25rem 2.5rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em' }}>FOLIO / DOC</th>
                   <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em' }}>CLIENTE</th>
                   <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em' }}>EMITIDO</th>
                   <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em' }}>ESTADO</th>
                   <th style={{ padding: '1.25rem 2.5rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em' }}>ACCIONES COMERCIALES</th>
                </tr>
             </thead>
             <tbody>
                {isLoading ? (
                   <tr>
                      <td colSpan={5} style={{ padding: '8rem', textAlign: 'center' }}>
                         <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto', color: 'var(--color-midnight)' }} />
                         <p style={{ marginTop: '1rem', fontWeight: 600 }}>Cargando repositorio comercial...</p>
                      </td>
                   </tr>
                ) : filteredDocs.length === 0 ? (
                   <tr>
                      <td colSpan={5} style={{ padding: '8rem', textAlign: 'center' }}>
                        <div style={{ opacity: 0.3 }}>
                          <AlertCircle size={48} style={{ margin: '0 auto 1.5rem' }} />
                          <p style={{ fontWeight: 800 }}>No hay cotizaciones registradas.</p>
                        </div>
                      </td>
                   </tr>
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
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>{q.cliente_empresa}</p>
                       </td>
                       <td style={{ padding: '2rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>
                          {new Date(q.created_at).toLocaleDateString()}
                       </td>
                       <td style={{ padding: '2rem 1rem' }}>
                          <span style={{ 
                            padding: '0.4rem 1rem', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 900,
                            backgroundColor: q.estado === 'enviada' ? '#E0F2FE' : '#D1FAE5',
                            color: q.estado === 'enviada' ? '#0369A1' : '#047857'
                          }}>
                             {q.estado === 'enviada' ? 'ENVIADA' : 'GENERADA'}
                          </span>
                       </td>
                       <td style={{ padding: '2rem 2.5rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                             <button 
                               onClick={() => downloadPDF(q)}
                               disabled={downloadingId === q.id}
                               className="btn" 
                               style={{ padding: '0.6rem', border: '1.5px solid #E2E8F0', color: 'var(--color-midnight)', borderRadius: '4px', position: 'relative' }} 
                               title="Descargar Cotización PDF"
                             >
                                {downloadingId === q.id ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                             </button>
                             <Link href={`/solicitudes/${q.id}`} className="btn" style={{ padding: '0.6rem 1.2rem', border: '1.5px solid var(--color-midnight)', color: 'var(--color-midnight)', fontSize: '0.7rem', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '4px' }}>
                                <ExternalLink size={14} /> DETALLES
                             </Link>
                             {q.estado === 'finalizada' && (
                               <button 
                                 onClick={() => markAsSent(q.id)}
                                 disabled={updatingId === q.id}
                                 className="btn" 
                                 style={{ 
                                   padding: '0.6rem 1.5rem', backgroundColor: 'var(--color-midnight)', 
                                   color: 'white', fontSize: '0.7rem', fontWeight: 900, borderRadius: '4px'
                                 }}
                               >
                                  {updatingId === q.id ? <Loader2 className="animate-spin" size={14} /> : 'ENVIAR AL CLIENTE'}
                                </button>
                             )}
                             {q.estado === 'enviada' && (
                               <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10B981', fontSize: '0.7rem', fontWeight: 900, padding: '0.6rem 1rem' }}>
                                  <CheckCircle2 size={16} /> ENVIADA
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

       <style jsx>{`
         .row-hover:hover {
           background-color: #F8FAFC;
         }
       `}</style>
    </div>
  );
}
