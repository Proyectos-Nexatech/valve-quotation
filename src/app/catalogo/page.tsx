'use client';

import React, { useEffect, useState } from 'react';
import { 
  Database, Search, Plus, Edit2, Trash2, 
  Check, X, Loader2, AlertCircle, Settings,
  FileText, Download, Upload, Info, FileStack, AlertTriangle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PriceItem {
  id: string;
  tipo_valvula: string;
  tamano: string;
  rating: string;
  servicio: string;
  ubicacion: string;
  costo_base: number | string;
  duracion?: number | string;
}

const VALVE_TYPES: Record<string, string> = {
  'manual': 'Válvula Manual',
  'safety': 'Válvula de Seguridad',
  'pressure-vacuum': 'Válvula Presión-Vacío',
  'on-off': 'Válvula On/Off',
  'control': 'Válvula de Control'
};

const DEFAULT_IVA = 19;

export default function CatalogoPricingPage() {
  const [items, setItems] = useState<PriceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<boolean>(false);
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkEditForm, setBulkEditForm] = useState<Partial<PriceItem>>({});

  const [editForm, setEditForm] = useState<Partial<PriceItem>>({});
  const [addForm, setAddForm] = useState<Partial<PriceItem>>({
    tipo_valvula: 'manual',
    tamano: '',
    rating: '',
    servicio: '',
    ubicacion: '',
    costo_base: '',
    duracion: ''
  });

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tarifario')
        .select('*')
        .order('tipo_valvula', { ascending: true });

      if (error) {
         if (error.code === '42P01') setDbError(true);
         throw error;
      }
      setItems(data || []);
      setDbError(false);
    } catch (err) {
      console.error('Error fetching pricing:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!addForm.servicio || !addForm.costo_base) {
      alert('Por favor completa todos los campos obligatorios del nuevo servicio.');
      return;
    }
    setSavingId('new');
    try {
      const { data, error } = await supabase
        .from('tarifario')
        .insert([{
          tipo_valvula: addForm.tipo_valvula,
          tamano: addForm.tamano,
          rating: addForm.rating,
          servicio: addForm.servicio,
          ubicacion: addForm.ubicacion,
          costo_base: parseFloat(addForm.costo_base as string),
          duracion: parseInt(addForm.duracion as string) || 0
        }])
        .select()
        .single();

      if (error) throw error;
      setItems([...items, data]);
      setIsAdding(false);
      setAddForm({ tipo_valvula: 'manual', tamano: '', rating: '', servicio: '', costo_base: '' });
      setDbError(false);
    } catch (err: any) {
      console.error('Error adding item:', err);
      if (err.code === '42P01') {
        alert('ERROR: Debes ajustar la tabla en Supabase agregando las nuevas columnas (tamano, rating).');
        setDbError(true);
      } else {
        alert('Error al guardar el ítem.');
      }
    } finally {
      setSavingId(null);
    }
  };

  const handleUpdateItem = async (id: string) => {
    setSavingId(id);
    try {
      const { error } = await supabase
        .from('tarifario')
        .update({
          tipo_valvula: editForm.tipo_valvula,
          tamano: editForm.tamano,
          rating: editForm.rating,
          servicio: editForm.servicio,
          ubicacion: editForm.ubicacion,
          costo_base: parseFloat(editForm.costo_base as string),
          duracion: parseInt(editForm.duracion as string) || 0
        })
        .eq('id', id);

      if (error) throw error;
      setItems(items.map(it => it.id === id ? { ...it, ...editForm } as PriceItem : it));
      setIsEditing(null);
    } catch (err) {
      console.error('Error updating item:', err);
      alert('Error al actualizar.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este ítem?')) return;
    try {
      const { error } = await supabase.from('tarifario').delete().eq('id', id);
      if (error) throw error;
      setItems(items.filter(it => it.id !== id));
      setSelectedIds(prev => prev.filter(i => i !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const startEdit = (item: PriceItem) => {
    setEditForm(item);
    setIsEditing(item.id);
  };

  const filteredItems = items.filter(it => 
    it.servicio.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (it.tamano || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    VALVE_TYPES[it.tipo_valvula].toLowerCase().includes(searchTerm.toLowerCase()) ||
    (it.ubicacion || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(it => it.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar ${selectedIds.length} ítems seleccionados?`)) return;
    setSavingId('bulk');
    try {
      const { error } = await supabase
        .from('tarifario')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;
      setItems(prev => prev.filter(it => !selectedIds.includes(it.id)));
      setSelectedIds([]);
    } catch (err) {
      console.error('Error deleting bulk:', err);
      alert('Error al eliminar en bloque.');
    } finally {
      setSavingId(null);
    }
  };

  const handleBulkUpdate = async () => {
    if (Object.keys(bulkEditForm).length === 0) {
      alert('No hay cambios definidos para aplicar.');
      return;
    }
    if (!window.confirm(`¿Deseas aplicar estos cambios a ${selectedIds.length} ítems?`)) return;
    
    setSavingId('bulk');
    try {
      const updates: any = { ...bulkEditForm };
      if (updates.costo_base) updates.costo_base = parseFloat(updates.costo_base as string);
      if (updates.duracion) updates.duracion = parseInt(updates.duracion as string);

      const { error } = await supabase
        .from('tarifario')
        .update(updates)
        .in('id', selectedIds);

      if (error) throw error;
      
      setItems(prev => prev.map(it => 
        selectedIds.includes(it.id) ? { ...it, ...updates } : it
      ));
      setIsBulkEditing(false);
      setSelectedIds([]);
      setBulkEditForm({});
    } catch (err) {
      console.error('Error updating bulk:', err);
      alert('Error en actualización masiva.');
    } finally {
      setSavingId(null);
    }
  };

  const downloadTemplate = () => {
    if (!window.confirm('¿Deseas descargar la plantilla base para el tarifario?')) return;
    
    // Headers in Spanish for the user
    const headers = 'Tipo_Valvula;Tamaño;Rating;Servicio;Ubicacion;Costo_Base;Duracion\n';
    const examples = [
      'manual;2";150#;Mantenimiento preventivo;Taller;150000;2',
      'control;4";300#;Calibración técnica;Campo;450000;4',
      'safety;1";600#;Prueba de disparo;Taller;280000;1'
    ].join('\n');
    
    // Add UTF-8 BOM for Excel compatibility with accents
    const BOM = '\uFEFF';
    const csvContent = BOM + headers + examples;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_tarifario_valvequote.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm(`¿Estás seguro de cargar el archivo "${file.name}"? Los datos se agregarán al catálogo actual.`)) {
      event.target.value = '';
      return;
    }

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/);
      const dataToInsert = [];

      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Support both semicolon (Spanish Excel) and comma (Standard)
        const delimiter = line.includes(';') ? ';' : ',';
        const columns = line.split(delimiter);
        
        if (columns.length >= 6) {
          const [tipo, tamano, rating, servicio, ubicacion, costo, duracion] = columns;
          
          if (tipo && servicio && (costo || ubicacion)) {
            dataToInsert.push({
              tipo_valvula: tipo.trim().toLowerCase(), // Normalize to internal keys
              tamano: tamano?.trim() || '',
              rating: rating?.trim() || '',
              servicio: servicio.trim(),
              ubicacion: ubicacion?.trim() || '',
              costo_base: parseFloat((costo || ubicacion || '').trim().replace(',', '.')) || 0,
              duracion: parseInt((duracion || '0').trim()) || 0
            });
          }
        }
      }

      if (dataToInsert.length === 0) {
        alert('No se encontraron datos válidos en el archivo.');
        setImporting(false);
        return;
      }

      try {
        const { error } = await supabase
          .from('tarifario')
          .insert(dataToInsert);

        if (error) throw error;
        
        alert(`¡Carga exitosa! Se agregaron ${dataToInsert.length} registros.`);
        setIsImportModalOpen(false);
        fetchPricing(); // Refresh list
      } catch (err) {
        console.error('Error importing CSV:', err);
        alert('Error al cargar el archivo. Verifica el formato.');
      } finally {
        setImporting(false);
        event.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
       {/* Header */}
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
             <h1 className="display-font" style={{ fontSize: '2.25rem', color: 'var(--color-midnight)', marginBottom: '0.5rem' }}>Catálogo Tarifario</h1>
             <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>Gestión de precios por tipo, tamaño y rating de válvulas.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <button 
               onClick={() => setIsImportModalOpen(true)}
               className="btn" 
               style={{ backgroundColor: 'white', color: 'var(--color-midnight)', border: '1.5px solid var(--color-midnight)', padding: '1rem 2rem', fontWeight: 800, borderRadius: 'var(--radius-sm)' }}
             >
                <FileStack size={18} /> IMPORTAR CSV
             </button>
             <button 
               onClick={() => setIsAdding(true)}
               className="btn" 
               style={{ backgroundColor: 'var(--color-midnight)', color: 'white', padding: '1rem 2rem', fontWeight: 800, borderRadius: 'var(--radius-sm)' }}
             >
                <Plus size={18} /> AGREGAR SERVICIO
             </button>
          </div>
       </div>

       {/* Instruction for Table Update if error */}
       {dbError && (
          <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5', padding: '1.5rem', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
             <AlertCircle color="#F97316" size={24} />
             <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#9A3412' }}>ACTUALIZACIÓN DE TABLA REQUERIDA</p>
                <p style={{ fontSize: '0.75rem', color: '#9A3412', marginTop: '0.25rem' }}>Para que las nuevas columnas (Tamaño y Rating) funcionen, debes recrear la tabla en Supabase SQL Editor:</p>
                <div style={{ marginTop: '1rem', backgroundColor: 'rgba(0,0,0,0.05)', padding: '1rem', borderRadius: '4px', fontSize: '0.625rem', fontFamily: 'monospace', color: '#9A3412' }}>
                   DROP TABLE IF EXISTS tarifario;<br />
                   CREATE TABLE tarifario (<br />
                   &nbsp;&nbsp;id uuid DEFAULT gen_random_uuid() PRIMARY KEY,<br />
                   &nbsp;&nbsp;tipo_valvula text, tamano text, rating text,<br />
                   &nbsp;&nbsp;servicio text, ubicacion text, costo_base numeric, duracion integer DEFAULT 0,<br />
                   &nbsp;&nbsp;created_at timestamptz DEFAULT now()<br />
                   );
                </div>
             </div>
          </div>
       )}

       {/* Toolbar */}
       <div style={{ display: 'flex', gap: '1.5rem', backgroundColor: 'white', padding: '1.5rem 2.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-high)', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ position: 'relative', flex: 1 }}>
             <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
             <input 
               type="text" placeholder="Filtrar por tamaño, rating, tipo..." 
               value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
               style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', border: '1px solid #E2E8F0', borderRadius: '8px', outline: 'none' }}
             />
          </div>
          
          {selectedIds.length > 0 && (
             <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: '#F0F9FF', padding: '0.5rem 1.5rem', borderRadius: '8px', border: '1px solid #BAE6FD' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0369A1' }}>{selectedIds.length} SELECCIONADOS</span>
                <button onClick={() => { setBulkEditForm({}); setIsBulkEditing(true); }} style={{ padding: '0.5rem 1rem', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 900, cursor: 'pointer' }}>
                  EDITAR BLOQUE
                </button>
                <button onClick={handleBulkDelete} style={{ padding: '0.5rem 1rem', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 900, cursor: 'pointer' }}>
                  ELIMINAR
                </button>
                <button onClick={() => setSelectedIds([])} style={{ backgroundColor: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
             </div>
          )}
       </div>

       {/* Detailed Data Table */}
       <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-high)', boxShadow: 'var(--shadow-md)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
             <thead style={{ backgroundColor: '#F8FAFC' }}>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-surface-high)' }}>
                   <th style={{ padding: '1.25rem 2rem', width: '40px' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.length === filteredItems.length && filteredItems.length > 0} 
                        onChange={toggleSelectAll} 
                      />
                   </th>
                   <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em' }}>TIPO VÁLVULA</th>
                   <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em' }}>TAMAÑO</th>
                   <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em' }}>RATING</th>
                   <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em' }}>DESCRIPCIÓN SERVICIO</th>
                   <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em' }}>DURACIÓN (HORAS)</th>
                   <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em' }}>UBICACIÓN</th>
                   <th style={{ padding: '1.25rem 1rem', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em' }}>COSTO BASE</th>
                   <th style={{ padding: '1.25rem 2rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em' }}>ACCIONES</th>
                </tr>
             </thead>
             <tbody>
                {/* Add Item Row */}
                {isAdding && (
                  <tr style={{ backgroundColor: '#F0F9FF', borderBottom: '2px solid #3B82F6' }}>
                     <td />
                     <td style={{ padding: '1.5rem 2rem' }}>
                        <select 
                          value={addForm.tipo_valvula} onChange={(e) => setAddForm({ ...addForm, tipo_valvula: e.target.value })}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #3B82F6' }}
                        >
                           {Object.entries(VALVE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                     </td>
                     <td style={{ padding: '1.5rem 1rem' }}>
                        <input placeholder='Ej: 2"' value={addForm.tamano} onChange={(e) => setAddForm({ ...addForm, tamano: e.target.value })}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #3B82F6' }} />
                     </td>
                     <td style={{ padding: '1.5rem 1rem' }}>
                        <input placeholder='Ej: 150#' value={addForm.rating} onChange={(e) => setAddForm({ ...addForm, rating: e.target.value })}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #3B82F6' }} />
                     </td>
                     <td style={{ padding: '1.5rem 1rem' }}>
                        <input placeholder='Servicio técnico...' value={addForm.servicio} onChange={(e) => setAddForm({ ...addForm, servicio: e.target.value })}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #3B82F6' }} />
                     </td>
                     <td style={{ padding: '1.5rem 1rem' }}>
                        <input type="number" placeholder='Horas' value={addForm.duracion} onChange={(e) => setAddForm({ ...addForm, duracion: e.target.value })}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #3B82F6' }} />
                     </td>
                     <td style={{ padding: '1.5rem 1rem' }}>
                        <input placeholder='Ej: Taller / In-Situ' value={addForm.ubicacion} onChange={(e) => setAddForm({ ...addForm, ubicacion: e.target.value })}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #3B82F6' }} />
                     </td>
                     <td style={{ padding: '1.5rem 1rem' }}>
                        <input type="number" placeholder='0' value={addForm.costo_base} onChange={(e) => setAddForm({ ...addForm, costo_base: e.target.value })}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #3B82F6', fontWeight: 800 }} />
                     </td>
                     <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                           <button onClick={handleAddItem} disabled={savingId === 'new'} style={{ padding: '0.65rem', backgroundColor: '#10B981', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                              {savingId === 'new' ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                           </button>
                           <button onClick={() => setIsAdding(false)} style={{ padding: '0.65rem', backgroundColor: '#EF4444', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                              <X size={16} />
                           </button>
                        </div>
                     </td>
                  </tr>
                )}

                {isLoading ? (
                  <tr><td colSpan={8} style={{ padding: '8rem', textAlign: 'center' }}><Loader2 className="animate-spin" size={40} style={{ margin: '0 auto' }} /></td></tr>
                ) : filteredItems.length === 0 && !isAdding ? (
                   <tr>
                      <td colSpan={8} style={{ padding: '8rem', textAlign: 'center', opacity: 0.3 }}>
                         <Database size={48} style={{ margin: '0 auto 1.5rem' }} />
                         <p style={{ fontWeight: 800 }}>Tarifario vacío o sin coincidencias.</p>
                      </td>
                   </tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: selectedIds.includes(item.id) ? '#F8FAFC' : 'transparent' }}>
                      {isEditing === item.id ? (
                        <>
                          <td style={{ padding: '1.5rem 2rem' }}>
                             <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelectOne(item.id)} />
                          </td>
                          <td style={{ padding: '1.5rem 2rem' }}>
                             <select value={editForm.tipo_valvula} onChange={(e) => setEditForm({ ...editForm, tipo_valvula: e.target.value })}
                               style={{ width: '100%', padding: '0.6rem', border: '1px solid #3B82F6', borderRadius: '4px' }}>
                                {Object.entries(VALVE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                             </select>
                          </td>
                          <td style={{ padding: '1.5rem 1rem' }}>
                             <input value={editForm.tamano} onChange={(e) => setEditForm({ ...editForm, tamano: e.target.value })}
                               style={{ width: '100%', padding: '0.6rem', border: '1px solid #3B82F6', borderRadius: '4px' }} />
                          </td>
                          <td style={{ padding: '1.5rem 1rem' }}>
                             <input value={editForm.rating} onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                               style={{ width: '100%', padding: '0.6rem', border: '1px solid #3B82F6', borderRadius: '4px' }} />
                          </td>
                          <td style={{ padding: '1.5rem 1rem' }}>
                             <input value={editForm.servicio} onChange={(e) => setEditForm({ ...editForm, servicio: e.target.value })}
                               style={{ width: '100%', padding: '0.6rem', border: '1px solid #3B82F6', borderRadius: '4px' }} />
                          </td>
                          <td style={{ padding: '1.5rem 1rem' }}>
                             <input type="number" value={editForm.duracion} onChange={(e) => setEditForm({ ...editForm, duracion: e.target.value })}
                               style={{ width: '100%', padding: '0.6rem', border: '1px solid #3B82F6', borderRadius: '4px' }} />
                             <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>Horas</span>
                          </td>
                          <td style={{ padding: '1.5rem 1rem' }}>
                             <input value={editForm.ubicacion || ''} onChange={(e) => setEditForm({ ...editForm, ubicacion: e.target.value })}
                               style={{ width: '100%', padding: '0.6rem', border: '1px solid #3B82F6', borderRadius: '4px' }} />
                          </td>
                          <td style={{ padding: '1.5rem 1rem' }}>
                             <input value={editForm.costo_base} onChange={(e) => setEditForm({ ...editForm, costo_base: e.target.value })}
                               style={{ width: '100%', padding: '0.6rem', border: '1px solid #3B82F6', borderRadius: '4px', fontWeight: 800 }} />
                          </td>
                          <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                             <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => handleUpdateItem(item.id)} style={{ padding: '0.6rem', backgroundColor: '#10B981', color: 'white', borderRadius: '4px', border: 'none' }}>
                                   {savingId === item.id ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                                </button>
                                <button onClick={() => setIsEditing(null)} style={{ padding: '0.6rem', backgroundColor: '#94A3B8', color: 'white', borderRadius: '4px', border: 'none' }}>
                                   <X size={16} />
                                </button>
                             </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ padding: '1.5rem 2rem' }}>
                             <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelectOne(item.id)} />
                          </td>
                          <td style={{ padding: '1.5rem 2rem' }}>
                             <span style={{ fontSize: '0.875rem', fontWeight: 900, color: 'var(--color-midnight)' }}>{VALVE_TYPES[item.tipo_valvula]}</span>
                          </td>
                          <td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem', fontWeight: 800 }}>{item.tamano || '—'}</td>
                          <td style={{ padding: '1.5rem 1rem' }}>
                             <span style={{ fontSize: '0.7rem', fontWeight: 900, backgroundColor: '#F8FAFC', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid #E2E8F0' }}>{item.rating || '—'}</span>
                          </td>
                          <td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>{item.servicio}</td>
                          <td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-maroon)' }}>{item.duracion || 0} H</td>
                          <td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-midnight)' }}>{item.ubicacion || '—'}</td>
                          <td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem', fontWeight: 900, color: '#111827' }}>
                             $ {parseFloat(item.costo_base as string).toLocaleString('es-CO')}
                          </td>
                          <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                             <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => startEdit(item)} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: '1.5px solid #E2E8F0', borderRadius: '4px', cursor: 'pointer' }}>
                                   <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDeleteItem(item.id)} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: '1.5px solid #FEE2E2', color: '#EF4444', borderRadius: '4px', cursor: 'pointer' }}>
                                   <Trash2 size={16} />
                                </button>
                             </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
             </tbody>
          </table>
        </div>

        {/* Import CSV Modal */}
        {isImportModalOpen && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
            <div style={{ backgroundColor: 'white', width: '90%', maxWidth: '600px', borderRadius: 'var(--radius-md)', padding: '2.5rem', boxShadow: 'var(--shadow-float)', position: 'relative' }}>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--color-on-surface-variant)' }}
              >
                <X size={24} />
              </button>
              
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{ backgroundColor: '#F1F5F9', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <FileText size={32} color="var(--color-midnight)" />
                </div>
                <h2 style={{ fontSize: '1.75rem', color: 'var(--color-midnight)', marginBottom: '0.5rem' }}>Importar Tabla Tarifaria</h2>
                <p style={{ color: 'var(--color-on-surface-variant)' }}>Sigue los pasos a continuación para cargar masivamente tus precios.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Step 1 */}
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ backgroundColor: 'var(--color-midnight)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, flexShrink: 0 }}>1</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--color-midnight)' }}>Descarga la Plantilla</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', marginTop: '0.25rem' }}>Obtén el archivo CSV base con las columnas requeridas.</p>
                    <button 
                      onClick={downloadTemplate}
                      style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3B82F6', fontSize: '0.875rem', fontWeight: 700 }}
                    >
                      <Download size={16} /> Descargar Plantilla .csv
                    </button>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ backgroundColor: 'var(--color-midnight)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, flexShrink: 0 }}>2</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--color-midnight)' }}>Diligencia la Información</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', marginTop: '0.25rem' }}>Asegúrate de usar los tipos de válvula correctos:</p>
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {Object.keys(VALVE_TYPES).map(k => (
                        <span key={k} style={{ fontSize: '0.625rem', backgroundColor: '#F8FAFC', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #E2E8F0', fontWeight: 700 }}>{k}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ backgroundColor: 'var(--color-midnight)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, flexShrink: 0 }}>3</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--color-midnight)' }}>Sube el Archivo</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', marginTop: '0.25rem' }}>Selecciona el archivo guardado para procesar la carga.</p>
                    
                    <label style={{ 
                      marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                      padding: '2rem', border: '2px dashed #CBD5E1', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                      backgroundColor: '#F8FAFC', transition: 'all 0.2s'
                    }}>
                      {importing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                          <Loader2 className="animate-spin" size={24} color="#3B82F6" />
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3B82F6' }}>Procesando...</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={24} color="#64748B" style={{ marginBottom: '0.5rem' }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-midnight)' }}>CLICK PARA SUBIR ARCHIVO</span>
                          <span style={{ fontSize: '0.625rem', color: 'var(--color-on-surface-variant)' }}>Solo archivos .csv</span>
                        </>
                      )}
                      <input 
                        type="file" accept=".csv" 
                        onChange={handleFileUpload}
                        disabled={importing}
                        style={{ display: 'none' }} 
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2.5rem', padding: '1rem', backgroundColor: '#FEF2F2', borderRadius: '4px', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <AlertTriangle size={16} color="#EF4444" />
                <p style={{ fontSize: '0.625rem', color: '#B91C1C', fontWeight: 700 }}>IMPORTANTE: Asegúrate de que las columnas coincidan exactamente con la plantilla para evitar errores en la base de datos.</p>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Edit Modal */}
        {isBulkEditing && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, backdropFilter: 'blur(8px)' }}>
            <div style={{ backgroundColor: 'white', width: '90%', maxWidth: '500px', borderRadius: 'var(--radius-md)', padding: '2.5rem', boxShadow: 'var(--shadow-float)' }}>
               <h2 style={{ fontSize: '1.5rem', color: 'var(--color-midnight)', marginBottom: '1rem', textAlign: 'center' }}>Edición Masiva</h2>
               <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '2rem' }}>
                 Se aplicarán los cambios a <strong>{selectedIds.length}</strong> ítems seleccionados. Solo llena los campos que deseas cambiar.
               </p>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem', display: 'block' }}>TIPO VÁLVULA</label>
                    <select 
                      value={bulkEditForm.tipo_valvula || ''} onChange={(e) => setBulkEditForm({ ...bulkEditForm, tipo_valvula: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #E2E8F0', outline: 'none' }}
                    >
                       <option value="">(Sin cambios)</option>
                       {Object.entries(VALVE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem', display: 'block' }}>TAMAÑO</label>
                      <input 
                        placeholder='No cambiar' value={bulkEditForm.tamano || ''} onChange={(e) => setBulkEditForm({ ...bulkEditForm, tamano: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #E2E8F0', outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem', display: 'block' }}>RATING</label>
                      <input 
                        placeholder='No cambiar' value={bulkEditForm.rating || ''} onChange={(e) => setBulkEditForm({ ...bulkEditForm, rating: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #E2E8F0', outline: 'none' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem', display: 'block' }}>UBICACIÓN</label>
                    <input 
                      placeholder='No cambiar' value={bulkEditForm.ubicacion || ''} onChange={(e) => setBulkEditForm({ ...bulkEditForm, ubicacion: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #E2E8F0', outline: 'none' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem', display: 'block' }}>DURACIÓN (HORAS)</label>
                    <input 
                      type="number" placeholder='No cambiar' value={bulkEditForm.duracion || ''} onChange={(e) => setBulkEditForm({ ...bulkEditForm, duracion: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #E2E8F0', outline: 'none' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem', display: 'block' }}>COSTO BASE</label>
                    <input 
                      type="number" placeholder='No cambiar' value={bulkEditForm.costo_base || ''} onChange={(e) => setBulkEditForm({ ...bulkEditForm, costo_base: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 800 }} />
                  </div>
               </div>

               <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setIsBulkEditing(false)} style={{ flex: 1, padding: '1rem', backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '4px', fontWeight: 800, color: '#64748B', cursor: 'pointer' }}>
                    CANCELAR
                  </button>
                  <button onClick={handleBulkUpdate} disabled={savingId === 'bulk'} style={{ flex: 2, padding: '1rem', backgroundColor: 'var(--color-midnight)', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    {savingId === 'bulk' ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />} APLICAR CAMBIOS
                  </button>
               </div>
            </div>
          </div>
        )}
     </div>
  );
}
