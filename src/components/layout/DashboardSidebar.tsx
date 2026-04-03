'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileSearch, Database, BarChart2, Settings, PlusCircle, LogOut } from 'lucide-react';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Inicio', icon: <Home size={18} />, path: '/dashboard' },
  { id: 'solicitudes', label: 'Solicitudes', icon: <PlusCircle size={18} />, path: '/solicitudes' },
  { id: 'cotizaciones', label: 'Cotizaciones', icon: <FileSearch size={18} />, path: '/cotizaciones' },
  { id: 'catalogo', label: 'Catálogo Tarifario', icon: <Database size={18} />, path: '/catalogo' },
  { id: 'analytics', label: 'Estadísticas', icon: <BarChart2 size={18} />, path: '/analytics' },
  { id: 'settings', label: 'Configuración', icon: <Settings size={18} />, path: '/configuracion' },
];

export const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <aside style={{
      width: '280px',
      backgroundColor: 'white',
      borderRight: '1px solid var(--color-surface-high)',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '2.5rem 1.5rem',
      position: 'fixed',
      left: 0,
      top: 0
    }}>
      <div style={{ marginBottom: '4rem', paddingLeft: '1rem' }}>
         <h2 className="display-font" style={{ fontSize: '1.125rem', color: 'var(--color-midnight)' }}>
            Industrial <span style={{ fontWeight: 400 }}>Solutions</span>
         </h2>
         <p style={{ fontSize: '0.625rem', color: 'var(--color-on-surface-variant)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>V2.0.4 TECHNICAL</p>
      </div>

      <nav style={{ flex: 1 }}>
         <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {MENU_ITEMS.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.id}>
                  <Link href={item.path} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.875rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: isActive ? 'var(--color-midnight)' : 'var(--color-on-surface-variant)',
                    backgroundColor: isActive ? 'var(--color-surface-low)' : 'transparent',
                    transition: 'all 0.2s',
                    borderLeft: isActive ? '3px solid var(--color-midnight)' : '3px solid transparent'
                  }}>
                    {item.icon} {item.label}
                  </Link>
                </li>
              );
            })}
         </ul>
      </nav>

      <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--color-surface-high)' }}>
         <Link href="/login" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.875rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#EF4444'
         }}>
           <LogOut size={18} /> Cerrar Sesión
         </Link>
      </div>
    </aside>
  );
};
