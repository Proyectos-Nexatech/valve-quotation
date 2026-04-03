import { DashboardSidebar } from '@/components/layout/DashboardSidebar';

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <DashboardSidebar />
      <main style={{ flex: 1, marginLeft: '280px', padding: '3rem 4rem' }}>
        {children}
      </main>
    </div>
  );
}
