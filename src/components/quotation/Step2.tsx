'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useQuotationStore, RequestItem } from '@/lib/store/useQuotationStore';
import { Plus, Trash2, ChevronRight, Hash, Download, Upload, FileSpreadsheet, Info, X, AlertCircle, MessageSquare } from 'lucide-react';

const VALVE_TYPES = [
  { id: 'manual', label: 'VÁLVULAS MANUALES' },
  { id: 'on-off', label: 'VÁLVULAS ON/OFF' },
  { id: 'pressure-vacuum', label: 'VÁLVULAS PRESIÓN - VACÍO' },
  { id: 'control', label: 'VÁLVULAS DE CONTROL' },
  { id: 'safety', label: 'VÁLVULAS DE SEGURIDAD Y/O ALIVIO' },
  { id: 'other', label: 'OTRO / POR DEFINIR' }
];

const SIZES = ['1/2"', '3/4"', '1"', '2"', '4"', '6"', '8"', '10"', '12"', '18"', '24"', 'N/A / Por Definir'];
const RATINGS = ['150#', '300#', '600#', '900#', '1500#', '2500#', 'N/A / Por Definir'];
const SERVICES = ['Mantenimiento General', 'Overhaul', 'Certificación', 'Inspección', 'Desconocido / Reemplazo'];

export const Step2 = () => {
  const { items, addItem, removeItem, updateItem, setItems, setStep } = useQuotationStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [generalDescription, setGeneralDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (items.length === 0) {
      addItem({
        id: Math.random().toString(36).substr(2, 9),
        valveType: 'manual',
        nominalSize: '2"',
        rating: '150#',
        serviceType: 'Mantenimiento General',
        location: 'Taller',
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
      location: 'Taller',
      technicalNotes: '',
      tag: '',
      quantity: 1,
      brand: '',
      serialNumber: ''
    });
  };

  const handleDownloadCSV = () => {
    if (!window.confirm('¿Deseas descargar la plantilla de inventario para carga masiva?')) return;
    
    const headers = [
      'Tipo_Valvula', // manual, on-off, control, pressure-vacuum, safety
      'Cantidad',
      'Tamano_Nominal',
      'Rating_Presion',
      'Tipo_Servicio',
      'Ubicacion',
      'Marca',
      'Serial',
      'Tag_Notas'
    ].join(';');

    const examples = [
      'manual;5;2";150#;Mantenimiento General;Taller;Fisher;F-100;Tag-123',
      'control;2;4";300#;Overhaul;Campo;Masoneilan;M-200;Tag-456',
      'safety;10;1";600#;Certificación;Taller;Crosby;C-300;Tag-789'
    ].join('\n');

    const csvContent = '\uFEFF' + headers + '\n' + examples;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_inventario_valvequote.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm(`¿Seguro que deseas cargar el archivo "${file.name}"? Los datos actuales del formulario serán reemplazados.`)) {
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/);
      
      // Basic validation
      if (lines.length < 2) {
        alert('El archivo parece estar vacío.');
        return;
      }

      const newItems: RequestItem[] = [];
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const columns = line.split(';');
        if (columns.length < 6) continue;

        newItems.push({
          id: Math.random().toString(36).substr(2, 9),
          valveType: (columns[0].toLowerCase() as any) || 'manual',
          quantity: parseInt(columns[1]) || 1,
          nominalSize: columns[2] || '2"',
          rating: columns[3] || '150#',
          serviceType: columns[4] || 'Mantenimiento General',
          location: columns[5] || 'Taller',
          brand: columns[6] || '',
          serialNumber: columns[7] || '',
          technicalNotes: columns[8] || '',
          tag: ''
        });
      }

      if (newItems.length > 0) {
        setItems(newItems);
        setIsModalOpen(false);
        alert(`Se han cargado ${newItems.length} partidas exitosamente.`);
      } else {
        alert('No se encontraron datos válidos en el archivo.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };
  
  const handleSaveDescription = () => {
    if (!generalDescription.trim()) {
      alert('Por favor ingrese una descripción.');
      return;
    }
    
    setItems([{
      id: Math.random().toString(36).substr(2, 9),
      valveType: 'other' as any,
      nominalSize: 'N/A / Por Definir',
      rating: 'N/A / Por Definir',
      serviceType: 'Desconocido / Reemplazo',
      location: 'Taller',
      brand: 'N/A',
      serialNumber: 'N/A',
      technicalNotes: `SOLICITUD REDACTADA POR USUARIO SIN ESPECIFICAR:\n\n${generalDescription}`,
      tag: '',
      quantity: 1
    }]);
    
    setIsDescriptionModalOpen(false);
    alert('Hemos registrado su requerimiento escrito. Puede confirmar la solicitud en el siguiente paso.');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '10rem' }}>
      <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ maxWidth: '600px' }}>
          <h1 className="display-font" style={{ fontSize: '2.5rem', color: 'var(--color-midnight)', marginBottom: '1rem' }}>Especificación de Equipos</h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>Defina los parámetros técnicos de las válvulas requeridas para la cotización técnica. Cada partida representa un grupo de equipos con características idénticas.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column', alignItems: 'flex-end' }}>
          <button 
            onClick={() => setIsDescriptionModalOpen(true)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem',
              backgroundColor: 'var(--color-midnight)', color: 'white',
              borderRadius: '4px', border: 'none',
              fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', width: '100%', justifyContent: 'center'
            }}
          >
            <MessageSquare size={16} /> NO SÉ LAS ESPECIFICACIONES
          </button>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem',
              backgroundColor: 'var(--color-surface-low)', color: 'var(--color-midnight)',
              borderRadius: '4px', border: '1px solid var(--color-surface-high)',
              fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', width: '100%', justifyContent: 'center'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-high)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-low)'}
          >
            <FileSpreadsheet size={16} /> CARGA MASIVA (CSV)
          </button>
        </div>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>TIPO DE SERVICIO</label>
                  <select
                    className="precision-input" style={{ width: '100%', padding: '0.75rem' }}
                    value={item.serviceType} onChange={(e) => updateItem(item.id, { serviceType: e.target.value })}
                  >
                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>UBICACIÓN</label>
                  <select
                    className="precision-input" style={{ width: '100%', padding: '0.75rem' }}
                    value={item.location} onChange={(e) => updateItem(item.id, { location: e.target.value })}
                  >
                    <option value="Taller">Taller</option>
                    <option value="In-Situ / Campo">In-Situ / Campo</option>
                    <option value="Workshop (Overseas)">Workshop (Overseas)</option>
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

      {/* CSV Import Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'white', width: '100%', maxWidth: '600px',
            borderRadius: 'var(--radius-sm)', overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <header style={{ 
              padding: '2rem', borderBottom: '1px solid var(--color-surface-high)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              backgroundColor: 'var(--color-surface-low)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--color-maroon)' }}><FileSpreadsheet size={24} /></div>
                <h2 className="display-font" style={{ fontSize: '1.25rem', fontWeight: 800 }}>CARGA MASIVA DE INVENTARIO</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ color: 'var(--color-on-surface-variant)' }}
              >
                <X size={24} />
              </button>
            </header>

            <div style={{ padding: '2.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '1.5rem', borderRadius: '4px', borderLeft: '4px solid var(--color-maroon)' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-midnight)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Info size={16} /> Instrucciones de Carga:
                  </p>
                  <ol style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)', paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                    <li>Descargue la plantilla CSV oficial haciendo clic en el botón de abajo.</li>
                    <li>Complete los datos de sus válvulas siguiendo el formato de ejemplo.</li>
                    <li>Guarde el archivo manteniendo la codificación UTF-8.</li>
                    <li>Suba el archivo y confirme la importación para cargar todas las partidas automáticamente.</li>
                  </ol>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>PASO 1: PREPARACIÓN</p>
                    <button 
                      onClick={handleDownloadCSV}
                      style={{
                        padding: '1.5rem', border: '1px solid var(--color-surface-high)', borderRadius: '4px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                        transition: 'all 0.2s', backgroundColor: 'white'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-maroon)'}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-surface-high)'}
                    >
                      <Download size={24} color="var(--color-maroon)" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>DESCARGAR PLANTILLA</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>PASO 2: CARGA</p>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: '1.5rem', border: '1px solid var(--color-surface-high)', borderRadius: '4px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                        transition: 'all 0.2s', backgroundColor: 'var(--color-midnight)', color: 'white'
                      }}
                    >
                      <Upload size={24} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>SUBIR ARCHIVO CSV</span>
                    </button>
                    <input 
                      type="file" accept=".csv" ref={fileInputRef} 
                      style={{ display: 'none' }} onChange={handleFileUpload} 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: '#FFFBEB', borderRadius: '4px', border: '1px solid #FEF3C7' }}>
                   <AlertCircle size={18} color="#D97706" />
                   <p style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: 600 }}>Nota: La carga de un nuevo archivo reemplazará cualquier dato que haya ingresado manualmente en este paso.</p>
                </div>
              </div>
            </div>

            <footer style={{ padding: '1.5rem 2rem', backgroundColor: 'var(--color-surface-low)', display: 'flex', justifyContent: 'flex-end' }}>
               <button 
                 onClick={() => setIsModalOpen(false)}
                 style={{ padding: '0.75rem 2rem', fontWeight: 700, fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}
               >
                 Cerrar Ventana
               </button>
            </footer>
          </div>
        </div>
      )}

      {/* Description Modal */}
      {isDescriptionModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'white', width: '100%', maxWidth: '600px',
            borderRadius: 'var(--radius-sm)', overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <header style={{ 
              padding: '2rem', borderBottom: '1px solid var(--color-surface-high)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              backgroundColor: 'var(--color-surface-low)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--color-midnight)' }}><MessageSquare size={24} /></div>
                <h2 className="display-font" style={{ fontSize: '1.25rem', fontWeight: 800 }}>DESCRIPCIÓN DE SOLICITUD</h2>
              </div>
              <button 
                onClick={() => setIsDescriptionModalOpen(false)}
                style={{ color: 'var(--color-on-surface-variant)' }}
              >
                <X size={24} />
              </button>
            </header>

            <div style={{ padding: '2.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)', lineHeight: '1.6' }}>
                  Si no cuenta con las especificaciones técnicas exactas de los equipos, puede describir detalladamente su requerimiento con sus propias palabras a continuación. Nuestro equipo de ingenieros lo analizará.
                </p>

                <textarea
                  className="precision-input"
                  placeholder="Ej: Necesito cotizar el mantenimiento general para 5 válvulas ubicadas en la planta de Mamonal. Son válvulas de bola tamaño 2 pulgadas pero desconozco la marca y rating específico..."
                  style={{ minHeight: '200px', resize: 'vertical', width: '100%', padding: '1rem', fontSize: '0.875rem' }}
                  value={generalDescription}
                  onChange={(e) => setGeneralDescription(e.target.value)}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: '#FFFBEB', borderRadius: '4px', border: '1px solid #FEF3C7' }}>
                   <AlertCircle size={18} color="#D97706" />
                   <p style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: 600 }}>Nota: Al guardar esta descripción, se reemplazarán temporalmente las casillas técnicas que haya llenado, creando una partida de texto libre.</p>
                </div>
              </div>
            </div>

            <footer style={{ padding: '1.5rem 2rem', backgroundColor: 'var(--color-surface-low)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
               <button 
                 onClick={() => setIsDescriptionModalOpen(false)}
                 style={{ padding: '0.75rem 2rem', fontWeight: 700, fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
               >
                 Cancelar
               </button>
               <button 
                 onClick={handleSaveDescription}
                 style={{ padding: '0.75rem 2rem', fontWeight: 700, fontSize: '0.75rem', backgroundColor: 'var(--color-midnight)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
               >
                 Guardar Requerimiento
               </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
