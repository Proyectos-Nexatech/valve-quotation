'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, User, Phone, Mail, Clock, CheckCircle2, 
  Plus, Download, Send, Globe, FileText, ChevronRight, Loader2,
  X, AlertTriangle, FileCheck, ShieldCheck, Share2, MessageSquare, Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const VALVE_TYPE_LABELS: Record<string, string> = {
  'manual': 'VÁLVULAS MANUALES',
  'safety': 'VÁLVULAS DE SEGURIDAD Y/O ALIVIO',
  'pressure-vacuum': 'VÁLVULAS PRESIÓN - VACÍO',
  'on-off': 'VÁLVULAS ON/OFF',
  'control': 'VÁLVULAS DE CONTROL'
};

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currency, setCurrency] = useState<'COP' | 'USD'>('COP');
  const [trm, setTrm] = useState('4250.00');
  const [discount, setDiscount] = useState('0');
  const [ivaRate, setIvaRate] = useState('19');
  const [catalogItems, setCatalogItems] = useState<any[]>([]);

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successUpdate, setSuccessUpdate] = useState(false);
  const [vendedores, setVendedores] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [unwrappedParams.id]);

  const fetchData = async () => {
    try {
      const { data: requestData, error: requestError } = await supabase
        .from('solicitudes')
        .select('*')
        .eq('id', unwrappedParams.id)
        .single();

      if (requestError) throw requestError;
      setRequest(requestData);

      const { data: itemsData, error: itemsError } = await supabase
        .from('items_solicitud')
        .select('*')
        .eq('solicitud_id', unwrappedParams.id);

      if (itemsError) throw itemsError;
      setItems(itemsData || []);

      const { data: vData } = await supabase.from('vendedores').select('nombre, id').eq('activo', true);
      setVendedores(vData || []);

      const { data: configData } = await supabase.from('configuracion_global').select('*').eq('id', 1).single();
      if (configData) {
        setIvaRate(configData.iva.toString());
        setTrm(configData.trm_actual.toString());
      }

      const { data: catData } = await supabase.from('tarifario').select('*');
      setCatalogItems(catData || []);

    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const finalizeQuote = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('solicitudes')
        .update({ estado: 'finalizada' })
        .eq('id', unwrappedParams.id);

      if (error) throw error;
      
      setSuccessUpdate(true);
      // Actualizar estado local
      setRequest({ ...request, estado: 'finalizada' });
      
      // Esperar un momento y cerrar el modal
      setTimeout(() => {
        setShowConfirmModal(false);
        setSuccessUpdate(false);
      }, 2000);

    } catch (err) {
      console.error('Error finalizando cotización:', err);
      alert('Hubo un error al actualizar el estado. Por favor intenta de nuevo.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '8rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-midnight)" />
        <p className="display-font" style={{ fontSize: '1.25rem', color: 'var(--color-midnight)' }}>Cargando cotización...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div style={{ padding: '8rem', textAlign: 'center' }}>
        <h2 className="display-font" style={{ fontSize: '2rem', color: 'var(--color-midnight)' }}>Solicitud No Encontrada</h2>
        <Link href="/solicitudes" style={{ color: 'var(--color-orange)', fontWeight: 700, marginTop: '1rem', display: 'inline-block' }}>Volver al Historial</Link>
      </div>
    );
  }


  const getBasePrice = (type: string) => {
    if (type === 'control') return 1912500;
    if (type === 'safety') return 1190000;
    return 850000;
  };

  const parseIndustrialSize = (str: string): number => {
    if (!str) return 0;
    // Limpiar comillas y normalizar
    let clean = str.replace(/"/g, '').trim().toLowerCase();
    
    // CASO ESPECIAL: 2-1/2 -> 2 + 0.5
    // Si viene solo un patrón de fracción mixta
    if (/^[0-9]+\s*[\-\s]\s*[0-9]+\/[0-9]+$/.test(clean)) {
       const parts = clean.split(/[\-\s]+/);
       const whole = parseFloat(parts[0]);
       const [num, den] = parts[1].split('/').map(Number);
       return whole + (num / den);
    }

    // Un enfoque más simple pero robusto: sumar todas las partes numéricas/fraccionarias
    // "1/2" -> 0.5
    // "2" -> 2
    // total = 2.5
    const parts = clean.split(/[\s]+/); // Solo por espacios para fracciones mixtas con espacio
    let total = 0;
    for (const p of parts) {
      if (p.includes('/')) {
        const subParts = p.split(/[\-]+/); // guión como separador de entera-fracción
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
    
    // Caso "X hasta Y"
    if (str.includes('hasta')) {
      const parts = str.split('hasta');
      return { min: parseIndustrialSize(parts[0]), max: parseIndustrialSize(parts[1]) };
    }

    // Caso "1/2-2-1/2" o "1/2 - 2-1/2"
    // Buscamos el guión principal de rango. 
    // Si hay espacios, preferimos el guión con espacios.
    if (str.includes(' - ')) {
       const parts = str.split(' - ');
       return { min: parseIndustrialSize(parts[0]), max: parseIndustrialSize(parts[1]) };
    }

    // Si no hay espacios, pero hay múltiples guiones (ej: 1/2-2-1/2)
    // El guión de rango suele ser el que no forma parte de una fracción mixta
    if (str.includes('-')) {
       // Si hay 3 números separados por guiones: A-B-C -> probablemente (A/D)-(B-C/D)
       // O (A-B)-C... muy ambiguo.
       // Específicamente para el caso del cliente: 1/2" -2-1/2"
       const parts = str.split('-');
       if (parts.length === 3) {
          // Caso [1/2, 2, 1/2] -> Min 1/2, Max 2+1/2
          return { min: parseIndustrialSize(parts[0]), max: parseIndustrialSize(parts[1] + '-' + parts[2]) };
       }
       
       const min = parseIndustrialSize(parts[0]);
       const max = parseIndustrialSize(parts[parts.length-1]);
       return { min, max };
    }

    return null;
  };

  const getEnrichedItemValue = (item: any, field: 'precio_unitario_cop' | 'duracion') => {
    if (item[field] !== null && item[field] !== undefined && item[field] !== 0) return item[field];
    
    const itemSizeNum = parseIndustrialSize(item.especificaciones?.nominalSize);
    const itemRatingNum = parseFloat(item.especificaciones?.rating?.replace(/[^0-9.]/g, '') || '0');

    // 1. Filtrar por Tipo, Tamaño y Rating primero
    const potentialMatches = catalogItems.filter(c => {
      // TIPO
      const typeMap: Record<string, string> = { 'manual': 'manual', 'safety': 'seguridad', 'on-off': 'on', 'control': 'control' };
      const catType = (c.tipo_valvula || '').toLowerCase();
      const itemType = typeMap[item.tipo_valvula] || item.tipo_valvula;
      if (!catType.includes(itemType)) return false;

      // MEDIDA (Manejo de rangos como "3 hasta 6", "1/2 - 2", "1/2" - 2-1/2")
      let sameSize = false;
      const range = decodeRange(c.tamano || '');
      if (range) {
         sameSize = (itemSizeNum >= range.min && itemSizeNum <= range.max);
      } else {
         sameSize = parseIndustrialSize(c.tamano) === itemSizeNum;
      }
      if (!sameSize) return false;

      // RATING (Manejo de 150-300 como "aplica para 150 y 300" o rangos)
      let sameRating = false;
      const rawRating = (c.rating || '').toString().toLowerCase();
      if (rawRating.includes('-') || rawRating.includes(',')) {
         const parts = rawRating.split(/[\s\-,/]+/);
         const ratings = parts.map((p: string) => parseFloat(p.replace(/[^0-9.]/g, '')));
         const min = Math.min(...ratings);
         const max = Math.max(...ratings);
         // Si es un rango explícito o una lista (ej: "150, 300, 600")
         sameRating = (itemRatingNum >= min && itemRatingNum <= max) || ratings.includes(itemRatingNum);
      } else {
         sameRating = parseFloat(rawRating.replace(/[^0-9.]/g, '')) === itemRatingNum;
      }
      
      return sameRating;
    });

    if (potentialMatches.length === 0) {
      if (field === 'precio_unitario_cop') return getBasePrice(item.tipo_valvula);
      return 0;
    }

    // 2. Priorizar por SERVICIO
    const itemServ = (item.servicio || '').toLowerCase();
    const serviceMatch = potentialMatches.find(c => {
      const catServ = (c.servicio || '').toLowerCase();
      const isMaint = itemServ.includes('mantenimiento') && (catServ.includes('mantenimiento') || catServ.includes('reparación') || catServ.includes('servicio'));
      const isCert = (itemServ.includes('certifica') || itemServ.includes('prueba')) && (catServ.includes('certifica') || catServ.includes('prueba') || catServ.includes('test'));
      return isMaint || isCert || catServ.includes(itemServ) || itemServ.includes(catServ);
    });

    const finalMatch = serviceMatch || potentialMatches[0];
    
    if (finalMatch) {
       const baseVal = finalMatch[field === 'precio_unitario_cop' ? 'costo_base' : 'duracion'];
       // Si es duración, multiplicar por cantidad
       if (field === 'duracion') return (baseVal || 0); // La suma total se hace con cantidad en otros lados
       return baseVal;
    }
    
    if (field === 'precio_unitario_cop') return getBasePrice(item.tipo_valvula);
    return 0;
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + (getEnrichedItemValue(item, 'precio_unitario_cop') * item.cantidad), 0);
  };

  const calculateTotalDurationDays = () => {
    const totalHours = items.reduce((acc, item) => acc + (getEnrichedItemValue(item, 'duracion') * item.cantidad), 0);
    return Math.ceil(totalHours / 8); 
  };

  const subtotal = calculateSubtotal();
  const totalDays = calculateTotalDurationDays();
  const discountVal = subtotal * (parseInt(discount) / 100);
  const baseGravable = subtotal - discountVal;
  const iva = baseGravable * (parseInt(ivaRate) / 100);
  const total = baseGravable + iva;

  const formatCurrency = (val: number) => {
    if (currency === 'USD') {
      const usdVal = val / parseFloat(trm);
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usdVal);
    }
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', position: 'relative' }}>
       {/* Breadcrumbs & Header */}
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
             <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-on-surface-variant)', marginBottom: '1rem', alignItems: 'center' }}>
                <Link href="/solicitudes">SOLICITUDES</Link> <ChevronRight size={12} /> <span style={{ color: 'var(--color-midnight)' }}>DETALLE</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <h1 className="display-font" style={{ fontSize: '2.5rem', color: 'var(--color-midnight)' }}>{request.folio}</h1>
                <span style={{ 
                  backgroundColor: request.estado === 'pendiente' ? '#FEF3C7' : 
                                 request.estado === 'finalizada' ? '#D1FAE5' : '#EFF6FF',
                  color: request.estado === 'pendiente' ? '#D97706' : 
                         request.estado === 'finalizada' ? '#059669' : '#3B82F6',
                  fontSize: '0.625rem', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 900, 
                  letterSpacing: '0.1em', fontFamily: 'var(--font-mono)'
                }}>
                  {(request.estado || 'RECIBIDO').toUpperCase()}
                </span>
             </div>
             <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
               Generada el {new Date(request.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })} • Prioridad {request.prioridad || 'Normal'}
             </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
             <div style={{ 
               backgroundColor: 'white', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-sm)', 
               border: '1px solid var(--color-surface-high)', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-sm)'
             }}>
               <Globe size={16} color="var(--color-on-surface-variant)" />
               <select 
                 value={currency} onChange={(e) => setCurrency(e.target.value as any)}
                 style={{ border: 'none', fontSize: '0.875rem', fontWeight: 700, backgroundColor: 'transparent', outline: 'none' }}
               >
                 <option value="COP">COLOMBIA (COP)</option>
                 <option value="USD">DÓLARES (USD)</option>
               </select>
             </div>
          </div>
       </div>

       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem', alignItems: 'start' }}>
          {/* Content */}
          <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '2.5rem', minWidth: '0' }}>
             <div style={{ backgroundColor: 'white', border: '1px solid var(--color-surface-high)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--color-surface-high)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <h3 className="display-font" style={{ fontSize: '1rem', color: 'var(--color-midnight)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FileText size={18} /> Tabla de Partidas
                   </h3>
                   <button style={{ color: 'var(--color-midnight)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Plus size={14} /> Agregar Ítem
                   </button>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-surface-low)', backgroundColor: '#F8FAFC' }}>
                          <th style={{ padding: '1rem 2.5rem', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>ÍTEM</th>
                          <th style={{ padding: '1rem', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>CANT.</th>
                          <th style={{ padding: '1rem', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>DESCRIPCIÓN TÉCNICA</th>
                          <th style={{ padding: '1rem', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>COSTO BASE (UND)</th>
                          <th style={{ padding: '1rem', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>DURACIÓN (HORAS)</th>
                          <th style={{ padding: '1rem 2.5rem', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>SUBTOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid var(--color-surface-low)' }}>
                            <td style={{ padding: '1.5rem 2.5rem', fontSize: '0.75rem', fontWeight: 700, opacity: 0.5 }}>{(idx + 1).toString().padStart(2, '0')}</td>
                            <td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem', fontWeight: 800 }}>{item.cantidad}</td>
                            <td style={{ padding: '1.5rem 1rem' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-midnight)', marginBottom: '0.25rem' }}>
                                  Válvula de {VALVE_TYPE_LABELS[item.tipo_valvula] || item.tipo_valvula} {item.especificaciones?.nominalSize} {item.especificaciones?.rating}
                                </h4>
                                <p style={{ fontSize: '0.625rem', color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)', lineHeight: '1.5' }}>
                                  {item.servicio} | Ubicación: {item.ubicacion || 'N/A'} | Marca: {item.especificaciones?.brand || 'Indeterminada'} | SN: {item.especificaciones?.serialNumber || 'N/A'}
                                </p>
                            </td>
                            <td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem', fontWeight: 600 }}>{formatCurrency(getEnrichedItemValue(item, 'precio_unitario_cop'))}</td>
                            <td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-maroon)' }}>{getEnrichedItemValue(item, 'duracion') * item.cantidad} H</td>
                            <td style={{ padding: '1.5rem 2.5rem', fontSize: '0.875rem', fontWeight: 800 }}>{formatCurrency(getEnrichedItemValue(item, 'precio_unitario_cop') * item.cantidad)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ backgroundColor: 'white', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end', borderTop: '2px solid var(--color-surface-low)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '400px' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>DURACIÓN TOTAL ESTIMADA (TURNOS 8H)</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 900, color: 'var(--color-maroon)' }}>{totalDays} DÍAS</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '400px' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>Subtotal de Equipos</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{formatCurrency(subtotal)}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '400px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>Descuento comercial (%)</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <input 
                           type="text" value={discount} onChange={(e) => setDiscount(e.target.value)}
                           style={{ width: '45px', padding: '0.4rem', border: '1px solid var(--color-surface-high)', borderRadius: '4px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 800 }} 
                         />
                         <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>%</span>
                      </div>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '400px' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>IVA ({ivaRate}%)</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{formatCurrency(iva)}</span>
                   </div>
                   <div style={{ width: '100%', maxWidth: '400px', height: '1px', backgroundColor: 'var(--color-surface-low)', margin: '1rem 0' }} />
                   <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '400px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>TOTAL FINAL</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                         <span className="display-font" style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--color-midnight)' }}>{formatCurrency(total)}</span>
                         <CheckCircle2 size={24} color={request.estado === 'finalizada' ? '#10B981' : '#E2E8F0'} />
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Sidebar */}
          <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             <div style={{ backgroundColor: 'white', padding: '2.5rem', border: '1px solid var(--color-surface-high)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)' }}>
                <h3 className="display-font" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--color-on-surface-variant)', marginBottom: '2rem' }}>CLIENTE</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                       <div style={{ width: '45px', height: '45px', backgroundColor: '#EFF6FF', color: '#3B82F6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem' }}>
                         {request.cliente_nombre?.substring(0, 2).toUpperCase()}
                       </div>
                       <div>
                          <p style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--color-midnight)' }}>{request.cliente_nombre}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>{request.cliente_empresa}</p>
                          <p style={{ fontSize: '0.625rem', color: 'var(--color-on-surface-variant)', marginTop: '0.25rem' }}>NIT: {request.cliente_nit}</p>
                       </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-on-surface-variant)' }}>
                       <Phone size={16} /> <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{request.cliente_telefono}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-on-surface-variant)' }}>
                       <Mail size={16} /> <span style={{ fontSize: '0.875rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden' }}>{request.cliente_email}</span>
                    </div>
                </div>
             </div>

             {/* CRM / Analytics Controls */}
             <div style={{ backgroundColor: 'white', padding: '2.5rem', border: '1px solid var(--color-surface-high)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)' }}>
                <h3 className="display-font" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--color-on-surface-variant)', marginBottom: '2rem' }}>CALIFICACIÓN COMERCIAL</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748B' }}>ESTADO DE CALIFICACIÓN</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                         <button 
                           onClick={async () => {
                             await supabase.from('solicitudes').update({ calificada: true }).eq('id', request.id);
                             setRequest({ ...request, calificada: true });
                           }}
                           style={{ 
                             padding: '0.75rem', borderRadius: '4px', border: '1px solid #E2E8F0', 
                             backgroundColor: request.calificada === true ? '#DCFCE7' : 'white',
                             color: request.calificada === true ? '#166534' : '#64748B', 
                             fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                           }}
                         >
                            <ShieldCheck size={16} /> CALIFICADA
                         </button>
                         <button 
                            onClick={async () => {
                              await supabase.from('solicitudes').update({ calificada: false }).eq('id', request.id);
                              setRequest({ ...request, calificada: false });
                            }}
                            style={{ 
                              padding: '0.75rem', borderRadius: '4px', border: '1px solid #E2E8F0', 
                              backgroundColor: request.calificada === false ? '#FEE2E2' : 'white',
                              color: request.calificada === false ? '#991B1B' : '#64748B', 
                              fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                         >
                            <X size={16} /> NO CALIFICA
                         </button>
                      </div>
                   </div>

                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748B' }}>CANAL DE ORIGEN</label>
                      <select 
                        value={request.canal_origen || 'web'}
                        onChange={async (e) => {
                          const val = e.target.value;
                          await supabase.from('solicitudes').update({ canal_origen: val }).eq('id', request.id);
                          setRequest({ ...request, canal_origen: val });
                        }}
                        style={{ padding: '0.875rem', borderRadius: '4px', border: '1px solid #E2E8F0', fontSize: '0.875rem', fontWeight: 700, appearance: 'none', backgroundColor: '#F8FAFC' }}
                      >
                         <option value="web">SITIO WEB</option>
                         <option value="whatsapp">WHATSAPP</option>
                         <option value="referido">REFERIDO / CLIENTE</option>
                         <option value="correo">CORREO DIRECTO</option>
                      </select>
                   </div>

                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label style={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748B' }}>VENDEDOR / RESPONSABLE</label>
                       <div style={{ position: 'relative' }}>
                          <select 
                            value={request.vendedor_asignado || ''}
                            onChange={async (e) => {
                               const val = e.target.value;
                               await supabase.from('solicitudes').update({ vendedor_asignado: val }).eq('id', request.id);
                               setRequest({ ...request, vendedor_asignado: val });
                            }}
                            style={{ width: '100%', padding: '0.875rem', paddingLeft: '2.5rem', borderRadius: '4px', border: '1px solid #E2E8F0', fontSize: '0.875rem', fontWeight: 700, appearance: 'none', backgroundColor: '#F8FAFC' }}
                          >
                             <option value="">Seleccionar responsable...</option>
                             {vendedores.map(v => (
                               <option key={v.id} value={v.nombre}>{v.nombre}</option>
                             ))}
                          </select>
                          <Briefcase size={16} style={{ position: 'absolute', left: '0.875rem', top: '1rem', color: '#94A3B8', pointerEvents: 'none' }} />
                       </div>
                    </div>
                </div>
             </div>

             <div style={{ backgroundColor: 'white', padding: '2.5rem', border: '1px solid var(--color-surface-high)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)' }}>
                <h3 className="display-font" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--color-on-surface-variant)', marginBottom: '2rem' }}>ACCIONES DE COTIZACIÓN</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                   <button 
                     onClick={() => setShowConfirmModal(true)}
                     className="btn" 
                     disabled={request.estado === 'finalizada'}
                     style={{ 
                       width: '100%', border: '2px solid var(--color-midnight)', color: 'var(--color-midnight)', 
                       fontWeight: 900, padding: '1rem', opacity: request.estado === 'finalizada' ? 0.5 : 1
                     }}
                   >
                      <Download size={18} /> PREVISUALIZAR PDF
                   </button>
                   <p style={{ fontSize: '0.625rem', opacity: 0.5, textAlign: 'center' }}>EL PDF SE AJUSTA A LA TRM Y DESCUENTO SELECCIONADOS</p>
                </div>
             </div>
          </div>
       </div>

       {/* Confirm / PDF Modal Overlay */}
       {showConfirmModal && (
         <div style={{ 
           position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
           backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
           zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
         }}>
           <div style={{ 
             backgroundColor: 'white', width: '100%', maxWidth: '850px', borderRadius: 'var(--radius-sm)',
             overflow: 'hidden', display: 'grid', gridTemplateColumns: successUpdate ? '1fr' : '1fr 300px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
           }}>
             
             {/* Left: PDF Visual Representation */}
             {!successUpdate ? (
                <>
                  <div style={{ padding: '3rem', borderRight: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                    <div style={{ backgroundColor: 'white', padding: '4rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', minHeight: '600px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid black', paddingBottom: '1rem' }}>
                             <div>
                                <h1 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Bustillo Ingeniería S.A.S.</h1>
                                <p style={{ fontSize: '0.75rem' }}>NIT: 900.XXX.XXX-X</p>
                             </div>
                             <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 900 }}>COTIZACIÓN</p>
                                <p style={{ fontSize: '1rem', color: '#EF4444', fontWeight: 800 }}>{request.folio}</p>
                             </div>
                         </div>

                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', fontSize: '0.75rem' }}>
                            <div>
                               <p style={{ fontWeight: 800, marginBottom: '0.5rem' }}>DIRIGIDO A:</p>
                               <p>{request.cliente_nombre}</p>
                               <p>{request.cliente_empresa}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                               <p>FECHA: {new Date().toLocaleDateString()}</p>
                               <p>MONEDA: {currency}</p>
                            </div>
                         </div>

                         <div style={{ flex: 1 }}>
                            <table style={{ width: '100%', fontSize: '0.625rem', borderCollapse: 'collapse' }}>
                               <thead style={{ backgroundColor: '#000', color: 'white' }}>
                                  <tr>
                                     <th style={{ padding: '0.5rem' }}>CANT</th>
                                     <th style={{ padding: '0.5rem', textAlign: 'left' }}>DESCRIPCIÓN</th>
                                     <th style={{ padding: '0.5rem' }}>VALOR UNIT.</th>
                                     <th style={{ padding: '0.5rem' }}>TOTAL</th>
                                  </tr>
                               </thead>
                               <tbody>
                                  {items.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #EEE' }}>
                                       <td style={{ padding: '0.5rem', textAlign: 'center' }}>{item.cantidad}</td>
                                       <td style={{ padding: '0.5rem' }}>Reparación Técnica Válvula {VALVE_TYPE_LABELS[item.tipo_valvula]}</td>
                                       <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatCurrency(item.precio_unitario_cop || getBasePrice(item.tipo_valvula))}</td>
                                       <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatCurrency((item.precio_unitario_cop || getBasePrice(item.tipo_valvula)) * item.cantidad)}</td>
                                    </tr>
                                  ))}
                               </tbody>
                            </table>
                         </div>

                         <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                             <p style={{ fontSize: '0.75rem' }}>Subtotal: {formatCurrency(subtotal)}</p>
                             <p style={{ fontSize: '0.75rem' }}>Descuento ({discount}%): -{formatCurrency(discountVal)}</p>
                             <p style={{ fontSize: '0.75rem' }}>IVA ({ivaRate}%): {formatCurrency(iva)}</p>
                             <p style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-maroon)' }}>DURACIÓN: {totalDays} DÍAS (8h/turno)</p>
                             <p style={{ fontSize: '1rem', fontWeight: 900, marginTop: '0.5rem', borderTop: '2px solid black', paddingTop: '0.5rem' }}>TOTAL: {formatCurrency(total)}</p>
                         </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'center' }}>
                     <button 
                       onClick={() => setShowConfirmModal(false)}
                       style={{ 
                         position: 'absolute', top: '1.5rem', right: '1.5rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'white' 
                       }}
                     >
                       <X size={24} />
                     </button>
                     
                     <div style={{ textAlign: 'center' }}>
                        <div style={{ backgroundColor: '#F59E0B', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'white' }}>
                          <AlertTriangle size={32} />
                        </div>
                        <h4 className="display-font" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Sellar y Finalizar</h4>
                        <p style={{ fontSize: '0.875rem', opacity: 0.6, lineHeight: '1.6' }}>
                          Al confirmar, la cotización se marcará como <strong>FINALIZADA</strong> en el sistema y se generará el documento oficial. Esta acción es irreversible.
                        </p>
                     </div>

                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                        <button 
                          onClick={finalizeQuote}
                          disabled={isUpdating}
                          className="btn" 
                          style={{ 
                            width: '100%', backgroundColor: 'var(--color-midnight)', color: 'white', fontWeight: 900, padding: '1.25rem'
                          }}
                        >
                          {isUpdating ? <Loader2 className="animate-spin" size={20} /> : 'CONFIRMAR Y GENERAR'}
                        </button>
                        <button 
                          onClick={() => setShowConfirmModal(false)}
                          style={{ 
                            width: '100%', border: 'none', background: 'transparent', color: 'var(--color-on-surface-variant)', fontSize: '0.875rem', fontWeight: 700 
                          }}
                        >
                          Cancelar
                        </button>
                     </div>
                  </div>
                </>
             ) : (
               /* Success View */
               <div style={{ padding: '6rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ width: '80px', height: '80px', backgroundColor: '#10B981', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'scaleUp 0.3s' }}>
                    <FileCheck size={40} />
                  </div>
                  <div>
                    <h3 className="display-font" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>¡Documento Generado!</h3>
                    <p style={{ opacity: 0.6 }}>La cotización <strong>{request.folio}</strong> ha sido finalizada con éxito.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                     <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem' }}>ESTADO ACTUAL</p>
                        <span style={{ backgroundColor: '#D1FAE5', color: '#059669', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 900 }}>FINALIZADA</span>
                     </div>
                  </div>
               </div>
             )}
           </div>
         </div>
       )}

       <style jsx>{`
          @keyframes scaleUp {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
       `}</style>
    </div>
  );
}
