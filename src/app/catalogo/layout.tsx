'use client';

import React from 'react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';

export default function CatalogoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex' }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: '3rem 5.5rem', marginLeft: '280px' }}>
        {children}
      </main>
    </div>
  );
}
