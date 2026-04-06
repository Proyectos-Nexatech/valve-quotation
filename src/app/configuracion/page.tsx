'use client';

import React, { useEffect, useState } from 'react';
import { 
  Settings, Building2, FileText, Globe, Save, 
  RefreshCcw, ShieldCheck, DollarSign, Loader2, Check, Search, List as ListIcon, Calendar as CalendarIcon, Upload, Trash, Users as UsersIcon, Shield
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';

export default function ConfigurationPage() {
  const [activeTab, setActiveTab] = useState<'variables' | 'company' | 'legal' | 'users' | 'template'>('variables');
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const { data: configData } = await supabase.from('configuracion_global').select('*').eq('id', 1).single();
      if (configData) setConfig(configData);

      const { data: profilesData } = await supabase.from('perfiles').select('*');
      setProfiles(profilesData || []);
    } catch (err) {
      console.error('Error fetching config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('configuracion_global')
        .update({
           ...config,
           updated_at: new Date()
        })
        .eq('id', 1);
      
      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Error guardando configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `company-logo-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setConfig({ ...config, logo_url: publicUrl });
      
      // Auto-save the new URL
      await supabase
        .from('configuracion_global')
        .update({ logo_url: publicUrl })
        .eq('id', 1);

    } catch (err) {
      console.error('Error uploading logo:', err);
      alert('Error al subir el logo. Asegúrate de tener el bucket "logos" creado en Supabase Storage como PUBLIC.');
    } finally {
      setIsUploading(false);
    }
  };

  const updateUserRole = async (userId: string, newRol: string) => {
    try {
      const { error } = await supabase
        .from('perfiles')
        .update({ rol: newRol })
        .eq('id', userId);
      
      if (error) throw error;
      setProfiles(profiles.map(p => p.id === userId ? { ...p, rol: newRol } : p));
      alert('Nivel de acceso actualizado correctamente.');
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Error al actualizar el nivel de acceso.');
    }
  };

  if (isLoading) return (
     <div style={{ padding: '8rem', textAlign: 'center' }}><Loader2 className="animate-spin" size={48} /></div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <DashboardSidebar />
      <main style={{ flex: 1, marginLeft: '280px', padding: '3rem 4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
           <div>
              <h1 className="display-font" style={{ fontSize: '2.5rem', color: 'var(--color-midnight)', marginBottom: '0.5rem' }}>Configuración del Sistema</h1>
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>Administra los parámetros de facturación, branding y políticas legales de ValveQuote.</p>
           </div>
           
           <button 
             onClick={saveConfig}
             disabled={isSaving}
             className="btn btn-secondary" style={{ padding: '0.75rem 2rem', gap: '0.75rem' }}
           >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : saveSuccess ? <Check size={18} /> : <Save size={18} />}
              {saveSuccess ? 'Guardado Exitoso' : 'Guardar Cambios'}
           </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--color-surface-high)', marginBottom: '2.5rem' }}>
           <TabItem label="Variables Globales" active={activeTab === 'variables'} onClick={() => setActiveTab('variables')} icon={<Globe size={16} />} />
           <TabItem label="Perfil de Empresa" active={activeTab === 'company'} onClick={() => setActiveTab('company')} icon={<Building2 size={16} />} />
           <TabItem label="Plantilla de Cotización" active={activeTab === 'template'} onClick={() => setActiveTab('template')} icon={<FileText size={16} />} />
           <TabItem label="Legales & PDF" active={activeTab === 'legal'} onClick={() => setActiveTab('legal')} icon={<Shield size={16} />} />
           <TabItem label="Gestión de Equipo" active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<UsersIcon size={16} />} />
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', padding: '3rem', border: '1px solid var(--color-surface-high)', boxShadow: 'var(--shadow-md)' }}>
           {activeTab === 'variables' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}>IMPUESTOS Y DIVISAS</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label style={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748B' }}>IVA ACTUAL (%)</label>
                       <input 
                         type="number" className="p-input"
                         value={config.iva} onChange={e => setConfig({ ...config, iva: parseFloat(e.target.value) })}
                       />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label style={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748B' }}>TRM REFERENCIAL (COP/USD)</label>
                       <div style={{ position: 'relative' }}>
                          <input 
                            type="number" className="p-input" style={{ paddingLeft: '2.5rem' }}
                            value={config.trm_actual} onChange={e => setConfig({ ...config, trm_actual: parseFloat(e.target.value) })}
                          />
                          <DollarSign size={16} style={{ position: 'absolute', left: '0.875rem', top: '0.875rem', opacity: 0.4 }} />
                       </div>
                    </div>
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}>PARÁMETROS COMERCIALES</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label style={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748B' }}>VIGENCIA DE COTIZACIÓN (DÍAS)</label>
                       <input 
                         type="number" className="p-input"
                         value={config.validez_dias} onChange={e => setConfig({ ...config, validez_dias: parseInt(e.target.value) })}
                       />
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'template' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 1.5fr', gap: '3rem' }}>
                 {/* Editor */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}>AJUSTES DE LA PLANTILLA</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label style={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748B' }}>ENCABEZADO (RAZÓN SOCIAL)</label>
                       <input className="p-input" value={config.razon_social || ''} onChange={e => setConfig({ ...config, razon_social: e.target.value })} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label style={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748B' }}>DATOS DE CONTACTO EN DOCUMENTO</label>
                       <textarea 
                         style={{ height: '100px', padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#F8FAFC' }}
                         value={`${config.direccion || ''}\n${config.ciudad || ''}\nTel: ${config.telefono_contacto || ''}\nEmail: ${config.email_contacto || ''}`}
                         readOnly
                       />
                       <p style={{ fontSize: '0.625rem', color: 'var(--color-on-surface-variant)' }}>Estos datos se sincronizan desde la pestaña "Perfil de Empresa".</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label style={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748B' }}>NOTAS ADICIONALES (POR DEFECTO)</label>
                       <textarea 
                         className="p-input" style={{ height: '120px' }}
                         value={config.terminos_condiciones || ''} onChange={e => setConfig({ ...config, terminos_condiciones: e.target.value })}
                       />
                    </div>
                 </div>

                 {/* Live Preview */}
                 <div style={{ padding: '2rem', backgroundColor: '#F1F5F9', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <p style={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748B', textAlign: 'center', marginBottom: '2rem', letterSpacing: '0.1em' }}>PREVISUALIZACIÓN DE DOCUMENTO (BORRADOR)</p>
                    
                    <div style={{ 
                       backgroundColor: 'white', padding: '3rem', width: '100%', minHeight: '600px', 
                       boxShadow: 'var(--shadow-lg)', border: '1px solid #CBD5E1', color: '#1E293B',
                       display: 'flex', flexDirection: 'column'
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4rem', paddingBottom: '2rem', borderBottom: '2px solid #F1F5F9' }}>
                           <div style={{ width: '120px', height: '120px', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                              {config.logo_url ? <img src={config.logo_url} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '0.625rem', opacity: 0.2 }}>LOGO</span>}
                           </div>
                           <div style={{ textAlign: 'right', flex: 1, paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-midnight)', margin: 0 }}>{config.razon_social}</h4>
                              <p style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: 700 }}>NIT: {config.nit}</p>
                              <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--color-red-bright)', marginBottom: '0.25rem' }}>COTIZACIÓN: VQ-2026-XXXX</span>
                              <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>{config.direccion}</p>
                              <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>Tel: {config.telefono_contacto} | Email: {config.email_contacto}</p>
                           </div>
                        </div>

                        {/* Body Placeholder */}
                        <div style={{ flex: 1 }}>
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                              <div>
                                 <p style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-maroon)', marginBottom: '0.75rem' }}>RECIBIDO DE:</p>
                                 <p style={{ fontSize: '0.875rem', fontWeight: 900, marginBottom: '0.25rem' }}>RICARDO CASTELLANOS</p>
                                 <p style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.2rem' }}>Empresa: PetroQuímica Industrial</p>
                                 <p style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.2rem' }}>NIT/ID: 900.123.456-1</p>
                                 <p style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.2rem' }}>Planta: Refinería Sector Norte</p>
                                 <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>Tel: +57 321 000 0000 | Email: ejemplo@correo.com</p>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                 <p style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.6, marginBottom: '0.5rem' }}>Fecha: {new Date().toLocaleDateString('es-CO')}</p>
                                 <p style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-midnight)' }}>Prioridad: Normal (5-10 días)</p>
                              </div>
                           </div>

                           <div style={{ width: '100%', height: '150px', border: '1px solid #E2E8F0', borderRadius: '4px', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
                              <p style={{ fontSize: '0.625rem', color: '#94A3B8', fontWeight: 800, letterSpacing: '0.1em' }}>DETALLE DE ITEMS Y ESPECIFICACIONES TÉCNICAS</p>
                           </div>
                        </div>

                       {/* Footer / Terms */}
                       <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#F8FAFC', borderLeft: '4px solid var(--color-maroon)' }}>
                          <p style={{ fontSize: '0.625rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-maroon)' }}>NOTAS DE LA PROPUESTA:</p>
                          <p style={{ fontSize: '0.625rem', lineHeight: 1.6, color: '#475569' }}>{config.terminos_condiciones}</p>
                       </div>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'company' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem' }}>
                 {/* Left Column: Details */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}>DATOS LEGALES Y CONTACTO</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label style={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748B' }}>RAZÓN SOCIAL</label>
                       <input 
                         className="p-input" value={config.razon_social || ''} 
                         onChange={e => setConfig({ ...config, razon_social: e.target.value })}
                       />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748B' }}>NIT / IDENTIFICACIÓN</label>
                          <input 
                            className="p-input" value={config.nit || ''} 
                            onChange={e => setConfig({ ...config, nit: e.target.value })}
                          />
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748B' }}>PÁGINA WEB</label>
                          <input 
                            className="p-input" value={config.web_url || ''} 
                            onChange={e => setConfig({ ...config, web_url: e.target.value })}
                          />
                       </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label style={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748B' }}>DIRECCIÓN FÍSICA</label>
                       <input 
                         className="p-input" value={config.direccion || ''} 
                         onChange={e => setConfig({ ...config, direccion: e.target.value })}
                       />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748B' }}>TELÉFONO DE CONTACTO</label>
                          <input 
                            className="p-input" value={config.telefono_contacto || ''} 
                            onChange={e => setConfig({ ...config, telefono_contacto: e.target.value })}
                          />
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748B' }}>EMAIL COMERCIAL</label>
                          <input 
                            className="p-input" value={config.email_contacto || ''} 
                            onChange={e => setConfig({ ...config, email_contacto: e.target.value })}
                          />
                       </div>
                    </div>
                 </div>

                 {/* Right Column: Branding */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}>IDENTIDAD VISUAL (LOGOTIPO)</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label style={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748B' }}>LOGOTIPO CORPORATIVO (PNG/SVG)</label>
                       <div style={{ display: 'flex', gap: '1rem' }}>
                          <label className="btn btn-secondary" style={{ flex: 1, cursor: 'pointer', padding: '0.875rem', fontSize: '0.75rem' }}>
                             {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                             {isUploading ? ' SUBIENDO...' : ' SELECCIONAR IMAGEN'}
                             <input type="file" hidden accept="image/*" onChange={handleLogoUpload} disabled={isUploading} />
                          </label>
                          {config.logo_url && (
                             <button 
                               onClick={() => setConfig({ ...config, logo_url: '' })}
                               style={{ padding: '0.875rem', border: '1px solid #FEE2E2', color: '#EF4444', borderRadius: '4px' }}
                             >
                                <Trash size={16} />
                             </button>
                          )}
                       </div>
                    </div>
                       
                    <div style={{ 
                       marginTop: '2rem', padding: '3rem', backgroundColor: '#F8FAFC', 
                       borderRadius: '8px', textAlign: 'center', border: '2px dashed #E2E8F0',
                       display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem'
                    }}>
                       <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.05em' }}>PREVISUALIZACIÓN EN DOCUMENTOS</p>
                       {config.logo_url ? (
                         <img src={config.logo_url} alt="Logo Preview" style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain' }} />
                       ) : (
                         <div style={{ width: '120px', height: '60px', backgroundColor: '#E2E8F0', borderRadius: '4px' }} />
                       )}
                       <p style={{ fontSize: '0.625rem', color: '#64748B', maxWidth: '200px', lineHeight: 1.5 }}>
                          Este logo se aplicará automáticamente al encabezado de todas las cotizaciones exportadas.
                       </p>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'legal' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748B' }}>TÉRMINOS Y CONDICIONES (TEXTO PDF)</label>
                    <textarea 
                      style={{ 
                        width: '100%', height: '200px', padding: '1.5rem', borderRadius: '4px',
                        border: '1px solid #E2E8F0', fontSize: '0.875rem', lineHeight: 1.6,
                        backgroundColor: '#F8FAFC', outline: 'none'
                      }}
                      value={config.terminos_condiciones} onChange={e => setConfig({ ...config, terminos_condiciones: e.target.value })}
                    />
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', backgroundColor: '#F0F9FF', borderRadius: '8px', border: '1px solid #BAE6FD' }}>
                    <ShieldCheck size={24} color="#0284C7" />
                    <p style={{ fontSize: '0.8125rem', color: '#0369A1' }}>
                       Este texto aparecerá al final de cada cotización exportada a PDF. Asegúrate de incluir tiempos de entrega y validez de la oferta.
                    </p>
                 </div>
              </div>
           )}

           {activeTab === 'users' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                       <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>ACCESO Y SEGURIDAD DEL EQUIPO</h3>
                       <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>Administra los niveles de permiso para cada integrante registrado.</p>
                    </div>
                 </div>

                 <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                       <thead>
                          <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F1F5F9' }}>
                             <th style={{ padding: '1rem 2rem', fontSize: '0.625rem', fontWeight: 800, color: '#64748B' }}>NOMBRE / ID</th>
                             <th style={{ padding: '1rem', fontSize: '0.625rem', fontWeight: 800, color: '#64748B' }}>ROL ACTUAL</th>
                             <th style={{ padding: '1rem 2rem', fontSize: '0.625rem', fontWeight: 800, color: '#64748B', textAlign: 'right' }}>ASIGNAR PERMISO</th>
                          </tr>
                       </thead>
                       <tbody>
                          {profiles.length === 0 ? (
                            <tr><td colSpan={3} style={{ padding: '4rem', textAlign: 'center', fontSize: '0.875rem', color: '#94A3B8' }}>No hay usuarios registrados en el sistema.</td></tr>
                          ) : profiles.map((p) => (
                             <tr key={p.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: 'white' }}>
                                <td style={{ padding: '1.25rem 2rem' }}>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'black', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>
                                         {String(p.nombre_completo || p.id).charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                         <p style={{ fontSize: '0.875rem', fontWeight: 800 }}>{p.nombre_completo || 'Usuario sin nombre'}</p>
                                         <p style={{ fontSize: '0.625rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>UUID: {p.id.substring(0, 12)}...</p>
                                      </div>
                                   </div>
                                </td>
                                <td style={{ padding: '1.25rem 1rem' }}>
                                   <span style={{ 
                                     padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 900,
                                     backgroundColor: p.rol === 'admin' ? '#FEE2E2' : p.rol === 'vendedor' ? '#E0F2FE' : '#F3F4F6',
                                     color: p.rol === 'admin' ? '#EF4444' : p.rol === 'vendedor' ? '#0369A1' : '#64748B',
                                     display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
                                   }}>
                                      <Shield size={10} /> {(p.rol || 'VENDEDOR').toUpperCase()}
                                   </span>
                                </td>
                                <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                                   <select 
                                     value={p.rol || 'vendedor'}
                                     onChange={(e) => updateUserRole(p.id, e.target.value)}
                                     style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, outline: 'none', backgroundColor: '#F8FAFC' }}
                                   >
                                      <option value="vendedor">VENDEDOR</option>
                                      <option value="tecnico">TÉCNICO</option>
                                      <option value="admin">ADMINISTRADOR</option>
                                   </select>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           )}
        </div>
      </main>

      <style jsx>{`
        .p-input {
          width: 100%;
          padding: 0.875rem;
          border-radius: 4px;
          border: 1px solid #E2E8F0;
          font-weight: 700;
          font-size: 0.875rem;
          outline: none;
          background-color: #F8FAFC;
        }
        .p-input:focus {
          border-color: var(--color-midnight);
          background-color: white;
        }
      `}</style>
    </div>
  );
}

function TabItem({ label, active, onClick, icon }: any) {
  return (
    <button 
      onClick={onClick}
      style={{ 
        display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1rem',
        borderBottom: active ? '3px solid var(--color-midnight)' : '3px solid transparent',
        color: active ? 'var(--color-midnight)' : '#94A3B8',
        fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.05em', transition: 'all 0.2s'
      }}
    >
      {icon}
      {label.toUpperCase()}
    </button>
  );
}
