'use client';

import React, { useState } from 'react';
import { useQuotationStore } from '@/lib/store/useQuotationStore';
import { CheckCircle2, FileText, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const VALVE_TYPE_LABELS: Record<string, string> = {
  'manual': 'VÁLVULAS MANUALES',
  'on-off': 'VÁLVULAS ON/OFF',
  'pressure-vacuum': 'VÁLVULAS PRESIÓN - VACÍO',
  'control': 'VÁLVULAS DE CONTROL',
  'safety': 'VÁLVULAS DE SEGURIDAD Y/O ALIVIO',
  'other': 'OTRO / POR DEFINIR'
};

export const ConfirmStep = () => {
  const { clientData, items, setStep, reset } = useQuotationStore();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [solId, setSolId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const folio = `VQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // 1. Insert lead request
      const { data: request, error: requestError } = await supabase
        .from('solicitudes')
        .insert({
          folio,
          cliente_nombre: clientData.name,
          cliente_empresa: clientData.company,
          cliente_nit: clientData.nit,
          cliente_email: clientData.email,
          cliente_telefono: clientData.phone,
          estado: 'pendiente'
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // 2. Insert items
      const itemsToInsert = items.map(item => ({
        solicitud_id: request.id,
        tipo_valvula: item.valveType,
        servicio: item.serviceType,
        cantidad: item.quantity,
        ubicacion: item.location,
        especificaciones: {
          nominalSize: item.nominalSize,
          rating: item.rating,
          brand: item.brand,
          serialNumber: item.serialNumber
        }
      }));

      const { error: itemsError } = await supabase
        .from('items_solicitud')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // 3. Notificar por email a proyectos@nexatech.com.co
      try {
        await fetch('/api/notify-solicitud', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            folio,
            clientData,
            items
          })
        });
      } catch (emailError) {
        console.error('Error al solicitar envío de correo:', emailError);
        // No bloquearemos el flujo de cara al cliente si falla el email, ya que los datos están guardados en Supabase.
      }

      setSolId(folio);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error enviando solicitud:', err);
      alert('Hubo un error al enviar tu solicitud. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <div style={{ 
          width: '80px', height: '80px', backgroundColor: '#D1FAE5', color: '#10B981', 
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
          margin: '0 auto 2rem' 
        }}>
           <CheckCircle2 size={40} />
        </div>
        <h1 className="display-font" style={{ fontSize: '2.5rem', color: 'var(--color-midnight)', marginBottom: '1.5rem' }}>Solicitud Recibida</h1>
        <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '1.125rem', marginBottom: '3.5rem', lineHeight: '1.6' }}>
          Hemos recibido tu solicitud de cotización técnica. Un ingeniero comercial revisará los detalles y recibirás tu propuesta formal en los próximos 15-20 minutos.
        </p>

        <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-high)', marginBottom: '3.5rem', boxShadow: 'var(--shadow-float)' }}>
           <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>CÓDIGO DE SEGUIMIENTO</p>
           <h2 className="display-font" style={{ fontSize: '2rem', color: 'var(--color-midnight)' }}>{solId}</h2>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
           <Link href="/" onClick={() => reset()} className="btn btn-secondary">
             Volver al Inicio
           </Link>
           <button className="btn btn-primary" style={{ backgroundColor: '#25D366' }}>
              WhatsApp Soporte
           </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '10rem' }}>
       <h1 className="display-font" style={{ fontSize: '2.5rem', color: 'var(--color-midnight)', marginBottom: '1rem' }}>Resumen de Solicitud</h1>
       <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem', marginBottom: '4rem' }}>Verifica que toda la información técnica sea correcta antes de enviar.</p>

       <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '4rem' }}>
          <div>
             <h3 className="display-font" style={{ fontSize: '1.125rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-surface-high)', paddingBottom: '1rem' }}>Válvulas Solicitadas</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {items.map((item, idx) => (
                  <div key={item.id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-high)', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                     <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--color-surface-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', color: 'var(--color-midnight)' }}>
                        <FileText size={20} />
                     </div>
                     <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-midnight)', marginBottom: '0.25rem' }}>
                           {VALVE_TYPE_LABELS[item.valveType]} {item.nominalSize} {item.rating}
                        </h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>{item.serviceType} ({item.location}) — Cantidad: {item.quantity}</p>
                     </div>
                     <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', fontWeight: 700, opacity: 0.5 }}>ITEM {(idx + 1).toString().padStart(2, '0')}</span>
                  </div>
                ))}
             </div>
          </div>

          <div>
             <h3 className="display-font" style={{ fontSize: '1.125rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-surface-high)', paddingBottom: '1rem' }}>Información de Contacto</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                   <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>CONTACTO</p>
                   <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-midnight)' }}>{clientData.name}</p>
                   <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>{clientData.company} - NIT: {clientData.nit}</p>
                </div>
                <div>
                   <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>EMAIL Y TELÉFONO</p>
                   <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>{clientData.email}</p>
                   <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>{clientData.phone}</p>
                </div>
                <div>
                   <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>PLANTA</p>
                   <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>{clientData.plant}</p>
                </div>
                <div>
                   <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>PRIORIDAD</p>
                   <span style={{ 
                     fontSize: '0.625rem', padding: '0.25rem 0.75rem', borderRadius: '20px',
                     backgroundColor: clientData.priority === 'Prioritario' ? '#FEE2E2' : '#EFF6FF',
                     color: clientData.priority === 'Prioritario' ? '#EF4444' : '#3B82F6',
                     fontWeight: 700
                   }}>{clientData.priority.toUpperCase()}</span>
                </div>
             </div>
          </div>
       </div>

       <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          backgroundColor: 'white', padding: '1.5rem 5.5rem',
          borderTop: '1px solid var(--color-surface-high)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 100
       }}>
          <button 
            onClick={() => setStep(2)}
            style={{ padding: '1rem 2rem', border: '1px solid var(--color-midnight)', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ArrowLeft size={16} /> Volver a Editar
          </button>

          <button 
            onClick={handleSubmit}
            style={{ 
              padding: '1rem 4rem', backgroundColor: 'var(--color-orange)', color: 'white', 
              borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '0.875rem',
              display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 10px 30px rgba(249, 115, 22, 0.3)'
            }}
          >
            ENVIAR SOLICITUD AHORA <Send size={18} />
          </button>
       </div>
    </div>
  );
};
