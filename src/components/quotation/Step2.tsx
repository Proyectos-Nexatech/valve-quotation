'use client';

import React, { useEffect } from 'react';
import { useQuotationStore, RequestItem } from '@/lib/store/useQuotationStore';
import { Plus, Trash2, ChevronRight, Hash } from 'lucide-react';

const VALVE_TYPES = [
  { id: 'manual', label: 'VÁLVULAS MANUALES' },
  { id: 'safety', label: 'VÁLVULAS DE SEGURIDAD Y/O ALIVIO' },
  { id: 'pressure-vacuum', label: 'VÁLVULAS PRESIÓN - VACÍO' },
  { id: 'on-off', label: 'VÁLVULAS ON/OFF' },
  { id: 'control', label: 'VÁLVULAS DE CONTROL' }
];

const SIZES = ['1/2"', '3/4"', '1"', '2"', '4"', '6"', '8"', '10"', '12"', '18"', '24"'];
const RATINGS = ['150#', '300#', '600#', '900#', '1500#', '2500#'];
const SERVICES = ['Mantenimiento General', 'Overhaul', 'Certificación', 'Inspección'];

export const Step2 = () => {
  const { items, addItem, removeItem, updateItem, setStep } = useQuotationStore();

  useEffect(() => {
    if (items.length === 0) {
      addItem({
        id: Math.random().toString(36).substr(2, 9),
        valveType: 'manual',
        nominalSize: '2"',
        rating: '150#',
        serviceType: 'Mantenimiento General',
        technicalNotes: '',
        tag: '',
        quantity: 1,
        brand: '',
        serialNumber: ''
      });
    }
  }, []);

  const handleAddNew = () => {
    addItem({
      id: Math.random().toString(36).substr(2, 9),
      valveType: 'manual',
      nominalSize: '2"',
      rating: '150#',
      serviceType: 'Mantenimiento General',
      technicalNotes: '',
      tag: '',
      quantity: 1,
      brand: '',
      serialNumber: ''
    });
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '10rem' }}>
      <header style={{ marginBottom: '4rem' }}>
         <h1 className="display-font" style={{ fontSize: '2.5rem', color: 'var(--color-midnight)', marginBottom: '1rem' }}>Especificación de Equipos</h1>
         <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>Defina los parámetros técnicos de las válvulas requeridas para la cotización técnica. Cada partida representa un grupo de equipos con características idénticas.</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {items.map((item, index) => (
          <div key={item.id} style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-float)',
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid var(--color-surface-high)'
          }}>
            {/* Partida label */}
            <div style={{
               position: 'absolute', top: '1.5rem', left: '-0.5rem',
               padding: '0.5rem 1rem', backgroundColor: 'var(--color-midnight)',
               color: 'white', fontSize: '0.625rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
               boxShadow: '4px 4px 10px rgba(0,0,0,0.1)'
            }}>
               PARTIDA {(index + 1).toString().padStart(2, '0')}
            </div>

            {/* Remove button */}
            {items.length > 1 && (
              <button 
                onClick={() => removeItem(item.id)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: '#EF4444', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Trash2 size={14} /> ELIMINAR PARTIDA
              </button>
            )}

            <div style={{ padding: '3.5rem 3rem 2.5rem', display: 'grid', gridTemplateColumns: '300px 1fr', gap: '3rem' }}>
               {/* Valve Type Choice */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>TIPO DE VÁLVULA</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {VALVE_TYPES.map((type) => (
                      <button 
                         key={type.id}
                         onClick={() => updateItem(item.id, { valveType: type.id as any })}
                         style={{
                            padding: '1rem', border: 'none', borderRadius: '4px',
                            backgroundColor: item.valveType === type.id ? 'var(--color-midnight)' : 'var(--color-surface-low)',
                            color: item.valveType === type.id ? 'white' : 'var(--color-on-surface)',
                            textAlign: 'left', fontSize: '0.7rem', fontWeight: 700,
                            display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s',
                            lineHeight: '1.2'
                         }}
                      >
                         <div style={{
                            width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0,
                            border: `2px solid ${item.valveType === type.id ? 'white' : 'var(--color-on-surface-variant)'}`,
                            backgroundColor: item.valveType === type.id ? 'white' : 'transparent'
                         }} />
                         {type.label}
                      </button>
                    ))}
                  </div>
               </div>

               {/* Configuration Fields */}
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                  {/* Cantidad Field */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-maroon)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Hash size={12} /> CANTIDAD DE EQUIPOS
                    </label>
                    <input 
                      type="number" min="1" required className="precision-input" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-midnight)' }}
                      value={item.quantity} onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>TAMAÑO NOMINAL</label>
                    <select 
                      className="precision-input" style={{ width: '100%', padding: '0.75rem' }}
                      value={item.nominalSize} onChange={(e) => updateItem(item.id, { nominalSize: e.target.value })}
                    >
                      {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>RATING / PRESIÓN</label>
                    <select 
                      className="precision-input" style={{ width: '100%', padding: '0.75rem' }}
                      value={item.rating} onChange={(e) => updateItem(item.id, { rating: e.target.value })}
                    >
                      {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>TIPO DE SERVICIO</label>
                    <select 
                      className="precision-input" style={{ width: '100%', padding: '0.75rem' }}
                      value={item.serviceType} onChange={(e) => updateItem(item.id, { serviceType: e.target.value })}
                    >
                      {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>MARCA / FABRICANTE</label>
                    <input 
                      type="text" className="precision-input" placeholder="Ej: Fisher, Crosby, Velan..." 
                      value={item.brand || ''} onChange={(e) => updateItem(item.id, { brand: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>SERIAL / NID</label>
                    <input 
                      type="text" className="precision-input" placeholder="X-10293-AB..." 
                      value={item.serialNumber || ''} onChange={(e) => updateItem(item.id, { serialNumber: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>NOTAS TÉCNICAS / TAG DEL EQUIPO</label>
                    <textarea 
                      className="precision-input" 
                      placeholder="Ingrese TAG o especificaciones de materiales (ej. ASTM A216 WCB)..."
                      style={{ minHeight: '100px', resize: 'none' }}
                      value={item.technicalNotes}
                      onChange={(e) => updateItem(item.id, { technicalNotes: e.target.value })}
                    />
                  </div>
               </div>
            </div>
          </div>
        ))}

        <button 
          onClick={handleAddNew}
          style={{
            padding: '2rem', border: '2px dashed var(--color-surface-highest)', borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
            color: 'var(--color-on-surface-variant)', fontWeight: 700, fontSize: '0.75rem',
            backgroundColor: 'transparent', transition: 'all 0.2s', fontFamily: 'var(--font-mono)'
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-midnight)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-surface-highest)'}
        >
          <Plus size={18} /> [ + AGREGAR OTRA VÁLVULA ]
        </button>
      </div>

      {/* Sticky footer for Summary */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        backgroundColor: 'white', padding: '1.5rem 5.5rem',
        borderTop: '1px solid var(--color-surface-high)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 100
      }}>
         <div>
            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>RESUMEN PARCIAL</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-midnight)' }}>
              {items.reduce((acc, curr) => acc + curr.quantity, 0)} Equipos en Total
            </p>
         </div>

         <div style={{ display: 'flex', gap: '1.5rem' }}>
            <button 
              onClick={() => setStep(1)}
              style={{ padding: '1rem 2rem', border: '1px solid var(--color-midnight)', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '0.875rem' }}
            >
              Anterior
            </button>
            <button 
              onClick={() => setStep(3)}
              style={{ 
                padding: '1rem 3rem', backgroundColor: 'var(--color-midnight)', color: 'white', 
                borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', gap: '1rem'
              }}
            >
              Confirmar Solicitud <ChevronRight size={18} />
            </button>
         </div>
      </div>
    </div>
  );
};
