'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileSearch, Database, BarChart2, Settings, PlusCircle, LogOut, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Inicio', icon: <Home size={18} />, path: '/dashboard' },
  { id: 'solicitudes', label: 'Solicitudes', icon: <PlusCircle size={18} />, path: '/solicitudes' },
  { id: 'cotizaciones', label: 'Cotizaciones', icon: <FileSearch size={18} />, path: '/cotizaciones' },
  { id: 'catalogo', label: 'Catálogo Tarifario', icon: <Database size={18} />, path: '/catalogo' },
  { id: 'vendedores', label: 'Vendedores', icon: <Users size={18} />, path: '/vendedores' },
  { id: 'analytics', label: 'Estadísticas', icon: <BarChart2 size={18} />, path: '/analytics' },
  { id: 'settings', label: 'Configuración', icon: <Settings size={18} />, path: '/configuracion' },
];

export const DashboardSidebar = () => {
  const pathname = usePathname();
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserData = async () => {
      setIsAuthLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('perfiles').select('rol').eq('id', user.id).single();
          if (profile) setUserRole(profile.rol);
        }
        
        const { data: config } = await supabase.from('configuracion_global').select('logo_url').eq('id', 1).single();
        if (config?.logo_url) setLogoUrl(config.logo_url);
      } catch (err) {
        console.error('Error fetching auth:', err);
      } finally {
        setIsAuthLoading(false);
      }
    };
    fetchUserData();
  }, []);

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
         {logoUrl ? (
           <img src={logoUrl} alt="Logo" style={{ maxHeight: '45px', marginBottom: '1.25rem' }} />
         ) : (
           <h2 className="display-font" style={{ fontSize: '1.5rem', color: 'var(--color-midnight)', marginBottom: '1.25rem' }}>
              Valve<span style={{ color: 'var(--color-orange)' }}>Quote</span>
           </h2>
         )}
         <p style={{ fontSize: '0.625rem', color: 'var(--color-on-surface-variant)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>V1.0 STABLE RELEASE</p>
      </div>

      <nav style={{ flex: 1 }}>
         <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {MENU_ITEMS.map((item) => {
              if (isAuthLoading) return null; // Esperar a confirmar identidad
              
              const isAdminRequired = ['analytics', 'settings'].includes(item.id);
              if (isAdminRequired && userRole !== 'admin') return null;

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

      <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--color-surface-high)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
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

         <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.875rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-on-surface-variant)',
            opacity: 0.8
         }}>
           <Home size={18} /> Volver a Inicio
         </Link>
      </div>
    </aside>
  );
};
