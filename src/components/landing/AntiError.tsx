import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const AntiError = () => {
  return (
    <section id="beneficios" style={{
      padding: '8rem 5.5rem',
      backgroundColor: 'var(--color-bg)',
      display: 'flex',
      gap: '4rem',
      alignItems: 'center'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{
          padding: '4rem',
          backgroundColor: 'var(--color-surface-low)',
          borderRadius: 'var(--radius-sm)',
          position: 'relative',
          overflow: 'hidden'
        }}>
           <div style={{ position: 'absolute', top: '24px', right: '32px', opacity: 0.1 }}>
             <AlertCircle size={120} />
           </div>
           <h2 className="display-font" style={{ fontSize: '2.5rem', color: 'var(--color-midnight)', marginBottom: '1.5rem', maxWidth: '350px' }}>Adiós a los errores de digitación</h2>
           <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '2.5rem', maxWidth: '400px' }}>
             Eliminamos la inconsistencia de los Excels manuales. Nuestra validación de campo asegura que cada tag de válvula sea único y correcto.
           </p>
           
           <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', padding: '0.5rem 1rem', backgroundColor: '#FEE2E2', color: '#EF4444', borderRadius: '4px' }}>
                VAL-AL-1234_ERROR
              </div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', padding: '0.5rem 1rem', backgroundColor: '#D1FAE5', color: '#10B981', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                VAL-AL-1234 <CheckCircle2 size={12} />
              </div>
           </div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div className="glass-card" style={{
          backgroundColor: 'var(--color-midnight)',
          color: 'white',
          padding: '4rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
           <h3 className="display-font" style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Historial Centralizado</h3>
           <p style={{ opacity: 0.6, fontSize: '0.925rem', lineHeight: '1.7', marginBottom: '2.5rem' }}>
             Toda la data de tu planta en un solo lugar. Consulta mantenimientos previos, certificados y repuestos en segundos.
           </p>
           
           <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '1.5rem' }} />
           <p style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', opacity: 0.4 }}>MÓDULO B-2 AKT-P03-01CL-E0</p>
        </div>
      </div>
    </section>
  );
};
