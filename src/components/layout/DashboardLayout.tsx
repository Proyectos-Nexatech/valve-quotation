'use client';

import React from 'react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div style={{ 
      backgroundColor: 'var(--color-bg)', 
      minHeight: '100vh', 
      width: '100%',
      position: 'relative'
    }}>
      <DashboardSidebar />
      <main style={{ 
        marginLeft: '280px',
        padding: '2.5rem 4rem', 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        width: 'calc(100% - 280px)',
        position: 'relative',
        overflowX: 'auto',
        boxSizing: 'border-box'
      }}>
        {children}
      </main>
    </div>
  );
}
