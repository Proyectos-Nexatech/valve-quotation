'use client';

import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, DollarSign, Clock, Users, ArrowUpRight, BarChart, PieChart, Activity, Zap, Loader2, Calendar, Download, Printer, FileText, ChevronDown
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null, end: Date | null }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Este mes por defecto
    end: new Date()
  });

  const [stats, setStats] = useState<any>({
    totalRequests: 0,
    totalQuotes: 0,
    sentQuotes: 0,
    projectedValue: 0,
    sentValue: 0,
    conversionRate: 0,
    adjudicatedValue: 0,
    adjudicatedQuotes: 0,
    topServices: [],
    funnelData: [],
    vendorPerformance: [],
    monthlyEvolution: [],
    avgResponseTime: '0.0'
  });
  const [ivaRate, setIvaRate] = useState(19);

  useEffect(() => {
    fetchStats();
  }, [selectedRange]);

  const handleExportCSV = () => {
    const csvRows = [
      ['ValveQuote - Reporte Comercial Bustillo Ingenieria'],
      ['Periodo:', selectedRange.start?.toLocaleDateString(), 'a', selectedRange.end?.toLocaleDateString()],
      [''],
      ['INDICADORES CLAVE'],
      ['Solicitudes Totales', stats.totalRequests],
      ['Cotizaciones Creadas', stats.totalQuotes],
      ['Efectividad Comercial', `${stats.conversionRate.toFixed(2)}%`],
      ['Valor Adjudicado (COP)', Math.round(stats.adjudicatedValue)],
      ['Tiempo Promedio (Horas)', stats.avgResponseTime],
      [''],
      ['RENDIMIENTO POR VENDEDOR'],
      ['Nombre', 'Solicitudes', 'Efectividad %', 'Valor Adjudicado'],
      ...stats.vendorPerformance.map((v: any) => [v.name, v.requests, `${v.rate.toFixed(1)}%`, Math.round(v.sentValue)])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_ValveQuote_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const handlePrint = () => { window.print(); };

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let currentUserId = null;
      if (user) {
        currentUserId = user.id;
        const { data: profile } = await supabase.from('perfiles').select('rol').eq('id', user.id).single();
        if (profile) setUserRole(profile.rol);
      }

      const { data: config } = await supabase.from('configuracion_global').select('iva').eq('id', 1).single();
      const currentIva = config?.iva || 19;
      setIvaRate(currentIva);

      let requestsQuery = supabase.from('solicitudes').select('*');
      let quotesQuery = supabase.from('cotizaciones').select('*'); // This is a bit misleading as it filters 'solicitudes' in fetchQuotations

      // We actually need data from 'solicitudes' table for both parts but differently filtered.
      // fetchStats uses requests and quotes from 'solicitudes' table essentially.
      
      const { data: requests } = await requestsQuery;
      const { data: quotesData } = await supabase.from('solicitudes').select('*').in('estado', ['finalizada', 'enviada', 'adjudicada']);

      if (!requests || !quotesData) return;

      const totalRequests = requests.length;
      const totalQuotes = quotesData.length;
      const sentQuotes = quotesData.filter(q => q.estado === 'enviada' || q.estado === 'adjudicada').length;
      const adjudicatedQuotes = quotesData.filter(q => q.estado === 'adjudicada').length;
      
      const subtotalProjected = quotesData.reduce((acc, q) => acc + (q.subtotal || 0), 0);
      const projectedValue = subtotalProjected * (1 + (currentIva / 100));
      
      const subtotalSent = quotesData.filter(q => q.estado === 'enviada' || q.estado === 'adjudicada').reduce((acc, q) => acc + (q.subtotal || 0), 0);
      const sentValue = subtotalSent * (1 + (currentIva / 100));

      const subtotalAdjudicated = quotesData.filter(q => q.estado === 'adjudicada').reduce((acc, q) => acc + (q.subtotal || 0), 0);
      const adjudicatedValue = subtotalAdjudicated * (1 + (currentIva / 100));
      
      const conversionRate = totalRequests > 0 ? (adjudicatedQuotes / totalRequests) * 100 : 0;

      const serviceCounts: any = {};
      requests.forEach(r => {
        const type = r.tipo_servicio || 'Mantenimiento General';
        serviceCounts[type] = (serviceCounts[type] || 0) + 1;
      });
      
      const topServices = Object.entries(serviceCounts)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

      let vendorStats: any[] = [];
      if (userRole === 'admin') {
        const { data: allProfiles } = await supabase.from('perfiles').select('id, nombre_completo, rol').order('nombre_completo');
        if (allProfiles) {
          vendorStats = allProfiles.map(profile => {
            const vRequests = requests.filter(r => r.vendedor_id === profile.id).length;
            const vWon = quotesData.filter(q => q.vendedor_id === profile.id && q.estado === 'adjudicada');
            const vWonValue = vWon.reduce((acc, q) => acc + (q.subtotal || 0), 0) * (1 + (currentIva / 100));
            const vRate = vRequests > 0 ? (vWon.length / vRequests) * 100 : 0;
            return {
              id: profile.id, name: profile.nombre_completo || 'Sin nombre', role: profile.rol,
              requests: vRequests, sentValue: vWonValue, rate: vRate
            };
          }).filter(v => v.requests > 0 || v.role === 'vendedor');
        }
      }

      let totalHours = 0;
      let quotesWithTime = 0;
      quotesData.forEach(q => {
        const sol = requests.find(r => r.id === q.id);
        if (sol && sol.created_at && q.created_at) {
          const diff = new Date(q.created_at).getTime() - new Date(sol.created_at).getTime();
          totalHours += diff / (1000 * 60 * 60);
          quotesWithTime++;
        }
      });
      const avgResponse = quotesWithTime > 0 ? (totalHours / quotesWithTime).toFixed(1) : '0';

      const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
      const currentMonth = new Date().getMonth();
      const lastSixMonths = [];
      for (let i = 5; i >= 0; i--) {
        const mIdx = (currentMonth - i + 12) % 12;
        const mYear = new Date().getFullYear() - (currentMonth - i < 0 ? 1 : 0);
        const mRequests = requests.filter(r => { const d = new Date(r.created_at); return d.getMonth() === mIdx && d.getFullYear() === mYear; }).length;
        const mWon = quotesData.filter(q => { const d = new Date(q.created_at); return d.getMonth() === mIdx && d.getFullYear() === mYear && q.estado === 'adjudicada'; }).length;
        lastSixMonths.push({ name: months[mIdx], requests: mRequests, quotes: mWon });
      }

      setStats({
        totalRequests, totalQuotes, sentQuotes, 
        projectedValue, sentValue, conversionRate,
        adjudicatedValue, adjudicatedQuotes,
        topServices,
        funnelData: [
          { name: 'Solicitados', value: totalRequests, color: '#94A3B8' },
          { name: 'Cotizados', value: totalQuotes, color: '#334155' },
          { name: 'Enviados', value: sentQuotes, color: '#EF4444' },
          { name: 'Adjudicados', value: adjudicatedQuotes, color: 'var(--color-midnight)' }
        ],
        vendorPerformance: vendorStats,
        monthlyEvolution: lastSixMonths,
        avgResponseTime: avgResponse
      });
    } catch (err) { console.error('Error fetching stats:', err); } finally { setIsLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <h1 className="display-font" style={{ fontSize: '2.5rem', color: 'var(--color-midnight)', marginBottom: '0.5rem' }}>Inteligencia Comercial</h1>
           <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>Análisis del ciclo de vida de válvulas y eficiencia técnica.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }} className="no-print">
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowDatePicker(!showDatePicker)} style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-high)', fontSize: '0.75rem', fontWeight: 800, backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <Calendar size={14} /> {selectedRange.start?.toLocaleDateString()} - {selectedRange.end?.toLocaleDateString()} <ChevronDown size={14} />
            </button>
            {showDatePicker && (
              <PremiumDatePicker onApply={(range: any) => { setSelectedRange(range); setShowDatePicker(false); }} onClose={() => setShowDatePicker(false)} currentRange={selectedRange} />
            )}
          </div>
          <button onClick={handleExportCSV} style={{ backgroundColor: 'white', border: '1px solid var(--color-surface-high)', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.625rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <Download size={14} /> EXPORTAR EXCEL
          </button>
          <button onClick={handlePrint} style={{ backgroundColor: 'var(--color-midnight)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.625rem', fontWeight: 900, border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
             <Printer size={14} /> GENERAR REPORTE PDF
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .container { max-width: 100% !important; margin: 0 !important; }
          nav, aside, footer { display: none !important; }
          h1 { margin-top: 0 !important; color: black !important; font-size: 1.5rem !important; }
          div[style*="grid"] { gap: 1rem !important; }
        }
      `}</style>

      {isLoading ? (
        <div style={{ padding: '8rem', textAlign: 'center' }}><Loader2 className="animate-spin" size={48} /></div>
      ) : (
        <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
           <StatCard label="Solicitudes Totales" value={stats.totalRequests.toString()} trend="+12%" icon={<Activity size={20} />} />
           <StatCard label="Eficiencia Estimación" value={`${((stats.totalQuotes/stats.totalRequests)*100).toFixed(1)}%`} trend="+8.5%" icon={<Zap size={20} />} />
           <StatCard label="Conversión Final" value={`${stats.conversionRate.toFixed(1)}%`} trend="+3.2%" icon={<TrendingUp size={20} />} />
           <StatCard label="Valor Bajo Gestión" value={`$${(stats.projectedValue / 1000000).toFixed(1)}M`} trend="+15%" icon={<DollarSign size={20} />} secondaryValue={`IVA ${ivaRate}% incluido`} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
           <div style={{ backgroundColor: 'white', border: '1px solid var(--color-surface-high)', borderRadius: 'var(--radius-md)', padding: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                 <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>EMBUDO DE CIERRE COMERCIAL</h3>
                    <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Traza de adjudicación y éxito de cierre.</p>
                 </div>
                 <BarChart size={24} color="var(--color-midnight)" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                 {stats.funnelData.map((stage: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '0.625rem', fontWeight: 900, color: '#111827', letterSpacing: '0.05em' }}>{stage.name.toUpperCase()}</span>
                          <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--color-midnight)' }}>{stage.value}</span>
                       </div>
                       <div style={{ width: '100%', height: '12px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${stats.totalRequests > 0 ? (stage.value / stats.totalRequests) * 100 : 0}%`, height: '100%', backgroundColor: stage.color, transition: 'width 1s ease-out' }} />
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ backgroundColor: 'var(--color-midnight)', borderRadius: 'var(--radius-md)', padding: '2.5rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
                 <div style={{ position: 'relative', zIndex: 10 }}>
                    <p style={{ fontSize: '0.625rem', fontWeight: 800, opacity: 0.6, letterSpacing: '0.1em' }}>VALOR ADJUDICADO (REAL)</p>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0.5rem 0' }}>${(stats.adjudicatedValue / 1000000).toFixed(2)}M</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4ADE80', fontSize: '0.75rem', fontWeight: 700 }}>
                       <TrendingUp size={14} /> {(stats.conversionRate).toFixed(1)}% de éxito total
                    </div>
                 </div>
                 <PieChart size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }} />
              </div>
              <div style={{ backgroundColor: 'white', border: '1px solid var(--color-surface-high)', borderRadius: 'var(--radius-md)', padding: '2rem', flex: 1 }}>
                 <h3 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '1.5rem' }}>INDICADORES DE DESARROLLO</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <EfficiencyItem label="Tasa de Adjudicación" value={`${stats.conversionRate.toFixed(1)}%`} status="TARGET" color="#4ADE80" />
                    <EfficiencyItem label="Lead Time (Respuesta)" value={`${stats.avgResponseTime}h`} status="OPTIMAL" color="#4ADE80" />
                    <EfficiencyItem label="Efectividad de Envío" value={`${((stats.sentQuotes/stats.totalQuotes)*100).toFixed(0)}%`} status="STABLE" color="#94A3B8" />
                 </div>
              </div>
           </div>
        </div>

        <div style={{ marginTop: '3rem', backgroundColor: 'white', border: '1px solid var(--color-surface-high)', borderRadius: 'var(--radius-md)', padding: '2.5rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <div>
                 <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>TENDENCIA DE ADJUDICACIÓN MENSUAL</h3>
                 <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Contraste entre solicitudes recibidas y contratos ganados.</p>
              </div>
           </div>
           <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '240px', gap: '1.5rem', paddingBottom: '2rem', borderBottom: '1px solid #F1F5F9' }}>
              {stats.monthlyEvolution.map((m: any, idx: number) => {
                 const maxVal = Math.max(...stats.monthlyEvolution.map((me: any) => Math.max(me.requests, me.quotes, 1)));
                 return (
                   <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', height: '100%' }}>
                      <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '0.25rem' }}>
                         <div style={{ width: '35%', height: `${(m.requests / maxVal) * 100}%`, backgroundColor: '#F1F5F9', borderRadius: '4px 4px 0 0', transition: 'height 1s ease' }} />
                         <div style={{ width: '35%', height: `${(m.quotes / maxVal) * 100}%`, backgroundColor: 'var(--color-midnight)', borderRadius: '4px 4px 0 0', transition: 'height 1s ease' }} />
                      </div>
                      <span style={{ fontSize: '0.625rem', fontWeight: 900, color: '#94A3B8' }}>{m.name}</span>
                   </div>
                 );
              })}
           </div>
        </div>

        {userRole === 'admin' && (
          <div style={{ marginTop: '3rem', backgroundColor: 'white', border: '1px solid var(--color-surface-high)', borderRadius: 'var(--radius-md)', padding: '2.5rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div><h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>MÉTRICAS POR GESTOR COMERCIAL</h3><p style={{ fontSize: '0.75rem', color: '#64748B' }}>Liderazgo y efectividad en el cierre de negocios.</p></div>
                <Users size={24} color="var(--color-midnight)" />
             </div>
             <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                   <thead>
                      <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                         <th style={{ padding: '1rem', fontSize: '0.625rem', fontWeight: 900, color: '#94A3B8', letterSpacing: '0.1em' }}>VENDEDOR / ID</th>
                         <th style={{ padding: '1rem', fontSize: '0.625rem', fontWeight: 900, color: '#94A3B8', letterSpacing: '0.1em' }}>SOLICITUDES</th>
                         <th style={{ padding: '1rem', fontSize: '0.625rem', fontWeight: 900, color: '#94A3B8', letterSpacing: '0.1em' }}>TASA CIERRE</th>
                         <th style={{ padding: '1rem', fontSize: '0.625rem', fontWeight: 900, color: '#94A3B8', letterSpacing: '0.1em', textAlign: 'right' }}>VALOR GANADO (IVA INC.)</th>
                      </tr>
                   </thead>
                   <tbody>
                      {stats.vendorPerformance.map((vendor: any, idx: number) => (
                         <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '1.25rem 1rem' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>{vendor.name.charAt(0)}</div>
                                  <div>
                                     <p style={{ fontSize: '0.875rem', fontWeight: 800 }}>{vendor.name.toUpperCase()}</p>
                                     <p style={{ fontSize: '0.625rem', color: '#94A3B8', fontWeight: 700 }}>ROL: {vendor.role.toUpperCase()}</p>
                                  </div>
                               </div>
                            </td>
                            <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 700 }}>{vendor.requests}</td>
                            <td style={{ padding: '1rem' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div style={{ flex: 1, height: '4px', backgroundColor: '#F1F5F9', borderRadius: '2px' }}><div style={{ width: `${vendor.rate}%`, height: '100%', backgroundColor: vendor.rate > 20 ? '#4ADE80' : 'var(--color-orange)', borderRadius: '2px' }} /></div>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>{vendor.rate.toFixed(1)}%</span>
                                </div>
                            </td>
                            <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 900, color: 'var(--color-midnight)', textAlign: 'right' }}>${new Intl.NumberFormat('es-CO').format(Math.round(vendor.sentValue))}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}
        </>
      )}
    </div>
  );
}

function PremiumDatePicker({ onApply, onClose, currentRange }: any) {
  const [localRange, setLocalRange] = useState(currentRange);
  const quickFilters = [
    { label: 'Este mes', range: { start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), end: new Date() } },
    { label: 'Mes pasado', range: { start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), end: new Date(new Date().getFullYear(), new Date().getMonth(), 0) } },
    { label: 'Este año', range: { start: new Date(new Date().getFullYear(), 0, 1), end: new Date() } }
  ];
  return (
    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '1rem', width: '350px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid var(--color-surface-high)', zIndex: 100, padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700 }}>RANGO DE FECHAS</h2>
        <button onClick={() => onApply(localRange)} style={{ padding: '0.4rem 1rem', borderRadius: '8px', border: 'none', backgroundColor: 'black', color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>Aplicar</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {quickFilters.map(f => ( <button key={f.label} onClick={() => { setLocalRange(f.range); onApply(f.range); }} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.75rem', fontWeight: 700, textAlign: 'left', backgroundColor: localRange.label === f.label ? '#F3F4F6' : 'white' }}> {f.label} </button> ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, icon, secondaryValue }: any) {
  return (
    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-high)', boxShadow: 'var(--shadow-sm)' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-midnight)' }}>{icon}</div>
          <span style={{ fontSize: '0.625rem', fontWeight: 900, color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ArrowUpRight size={12} /> {trend}</span>
       </div>
       <h4 style={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748B', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>{label.toUpperCase()}</h4>
       <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-midnight)' }}>{value}</p>
       {secondaryValue && <p style={{ fontSize: '0.625rem', color: '#94A3B8', marginTop: '0.4rem', fontWeight: 600 }}>{secondaryValue}</p>}
    </div>
  );
}

function EfficiencyItem({ label, value, status, color }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}><span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{label}</span><span style={{ fontSize: '0.625rem', color: color, fontWeight: 900 }}>{status}</span></div>
       <span style={{ fontSize: '1rem', fontWeight: 900 }}>{value}</span>
    </div>
  );
}
