'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, Plus, Search, Mail, Phone, Briefcase, 
  Trash2, Edit2, Loader2, X, Check, MoreVertical
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';

export default function VendedoresPage() {
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendedor, setEditingVendedor] = useState<any>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    cargo: 'Ingeniero de Ventas',
    activo: true
  });

  useEffect(() => {
    fetchVendedores();
  }, []);

  const fetchVendedores = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendedores')
        .select('*')
        .order('nombre', { ascending: true });
      
      if (error) throw error;
      setVendedores(data || []);
    } catch (err) {
      console.error('Error fetching vendedores:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVendedor) {
        const { error } = await supabase
          .from('vendedores')
          .update(formData)
          .eq('id', editingVendedor.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('vendedores')
          .insert([formData]);
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      setEditingVendedor(null);
      setFormData({ nombre: '', email: '', telefono: '', cargo: 'Ingeniero de Ventas', activo: true });
      fetchVendedores();
    } catch (err) {
      alert('Error al guardar vendedor. Verifica que el correo sea único.');
    }
  };

  const deleteVendedor = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este vendedor?')) return;
    try {
      const { error } = await supabase.from('vendedores').delete().eq('id', id);
      if (error) throw error;
      fetchVendedores();
    } catch (err) {
      console.error('Error deleting vendedor:', err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <DashboardSidebar />
      <main style={{ flex: 1, marginLeft: '280px', padding: '3rem 4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
           <div>
              <h1 className="display-font" style={{ fontSize: '2.5rem', color: 'var(--color-midnight)', marginBottom: '0.5rem' }}>Gestión de Vendedores</h1>
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>Administra el equipo comercial y sus credenciales de asignación.</p>
           </div>
           <button 
             onClick={() => { setEditingVendedor(null); setFormData({ nombre: '', email: '', telefono: '', cargo: 'Ingeniero de Ventas', activo: true }); setIsModalOpen(true); }}
             className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
           >
              Nuevo Vendedor <Plus size={18} />
           </button>
        </div>

        {/* List Table */}
        <div style={{ 
           backgroundColor: 'white', border: '1px solid var(--color-surface-high)', 
           borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' 
        }}>
           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                 <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-surface-high)', backgroundColor: '#F8FAFC' }}>
                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>VENDEDOR</th>
                    <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>CARGO</th>
                    <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>CONTACTO</th>
                    <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>ESTADO</th>
                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>ACCIONES</th>
                 </tr>
              </thead>
              <tbody>
                 {isLoading ? (
                   <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center' }}><Loader2 className="animate-spin" /></td></tr>
                 ) : vendedores.length === 0 ? (
                   <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: '#94A3B8' }}>No hay vendedores registrados.</td></tr>
                 ) : vendedores.map(v => (
                   <tr key={v.id} style={{ borderBottom: '1px solid var(--color-surface-low)' }}>
                      <td style={{ padding: '1.5rem 2rem' }}>
                         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#F1F5F9', color: 'var(--color-midnight)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.875rem' }}>
                               {v.nombre.substring(0, 2).toUpperCase()}
                            </div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-midnight)' }}>{v.nombre}</p>
                         </div>
                      </td>
                      <td style={{ padding: '1.5rem 1rem' }}>
                         <span style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>{v.cargo}</span>
                      </td>
                      <td style={{ padding: '1.5rem 1rem' }}>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={12} /> {v.email}</p>
                            <p style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={12} /> {v.telefono || 'N/A'}</p>
                         </div>
                      </td>
                      <td style={{ padding: '1.5rem 1rem' }}>
                         <span style={{ 
                            fontSize: '0.625rem', padding: '0.25rem 0.75rem', borderRadius: '4px',
                            backgroundColor: v.activo ? '#DCFCE7' : '#F1F5F9',
                            color: v.activo ? '#166534' : '#64748B', fontWeight: 800
                         }}>
                            {v.activo ? 'ACTIVO' : 'INACTIVO'}
                         </span>
                      </td>
                      <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                         <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => { setEditingVendedor(v); setFormData({ nombre: v.nombre, email: v.email, telefono: v.telefono, cargo: v.cargo, activo: v.activo }); setIsModalOpen(true); }}
                              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #E2E8F0', color: '#64748B' }}
                            ><Edit2 size={14} /></button>
                            <button 
                              onClick={() => deleteVendedor(v.id)}
                              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #FEE2E2', color: '#EF4444' }}
                            ><Trash2 size={14} /></button>
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
             <div style={{ backgroundColor: 'white', width: '500px', borderRadius: 'var(--radius-md)', padding: '3rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                   <h3 className="display-font" style={{ fontSize: '1.25rem' }}>{editingVendedor ? 'Editar Vendedor' : 'Nuevo Registro'}</h3>
                   <X size={24} style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.625rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>NOMBRE COMPLETO</label>
                      <input 
                        required type="text" className="precision-input" placeholder="Nombre completo"
                        value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                        style={{ border: '1px solid #E2E8F0', padding: '0.875rem' }}
                      />
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.625rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>CORREO ELECTRÓNICO</label>
                      <input 
                        required type="email" className="precision-input" placeholder="email@bustillo.com"
                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                        style={{ border: '1px solid #E2E8F0', padding: '0.875rem' }}
                      />
                   </div>
                   <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                         <label style={{ fontSize: '0.625rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>TELÉFONO</label>
                         <input 
                           type="text" className="precision-input" placeholder="+57"
                           value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                           style={{ border: '1px solid #E2E8F0', padding: '0.875rem' }}
                         />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                         <label style={{ fontSize: '0.625rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>CARGO</label>
                         <select 
                           value={formData.cargo} onChange={e => setFormData({ ...formData, cargo: e.target.value })}
                           style={{ padding: '0.875rem', border: '1px solid #E2E8F0', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 700 }}
                         >
                            <option value="Ingeniero de Ventas">Ing. Ventas</option>
                            <option value="Gerente Comercial">Gerente Comercial</option>
                            <option value="Especialista de Producto">Especialista</option>
                         </select>
                      </div>
                   </div>

                   <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginTop: '1rem' }}>
                      <input 
                        type="checkbox" checked={formData.activo} onChange={e => setFormData({ ...formData, activo: e.target.checked })} 
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Vendedor Activo / En ejercicio</span>
                   </label>

                   <button type="submit" className="btn btn-secondary" style={{ padding: '1rem', marginTop: '2rem' }}>
                      {editingVendedor ? 'Actualizar Información' : 'Registrar Vendedor'}
                   </button>
                </form>
             </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .precision-input {
          width: 100%;
          border-radius: 4px;
          font-weight: 700;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .precision-input:focus {
          border-color: var(--color-midnight);
        }
      `}</style>
    </div>
  );
}
