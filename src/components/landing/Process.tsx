import React from 'react';
import { ArrowRight } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    title: 'LEVANTAMIENTO',
    description: 'Sube tu inventario de válvulas a nuestra plataforma digital en segundos.'
  },
  {
    number: '02',
    title: 'ANÁLISIS TÉCNICO',
    description: 'Nuestros ingenieros evalúan las especificaciones y el alcance del servicio.'
  },
  {
    number: '03',
    title: 'CERTIFICACIÓN',
    description: 'Recibe tu cotización y certificados técnicos listos para tu auditoría.'
  }
];

export const Process = () => {
  return (
    <section id="como-funciona" style={{
      padding: '10rem 5.5rem',
      backgroundColor: '#F8FAFC',
      position: 'relative'
    }}>
      <div style={{ marginBottom: '8rem', textAlign: 'center' }}>
        <p style={{ 
          fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.4em', color: 'var(--color-red-bright)', 
          textTransform: 'uppercase', marginBottom: '1.5rem' 
        }}>
          Metodología de Trabajo
        </p>
        <h2 className="display-font" style={{ 
          fontSize: '3.5rem', color: 'var(--color-slate-800)', marginBottom: '1.5rem', 
          fontWeight: 900, textTransform: 'uppercase' 
        }}>
          PROCESO DE <span style={{ color: 'var(--color-maroon)' }}>INGENIERÍA</span>
        </h2>
        <div style={{ width: '80px', height: '4px', backgroundColor: 'var(--color-red-bright)', margin: '0 auto' }} />
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '4rem',
        position: 'relative'
      }}>
        {/* Connector Line */}
        <div style={{
          position: 'absolute', top: '70px', left: '10%', right: '10%', height: '2px', 
          backgroundColor: 'var(--color-surface-high)', zIndex: 1
        }} />

        {STEPS.map((step, idx) => (
          <div key={idx} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <div style={{
              width: '140px', height: '140px', backgroundColor: 'white', borderRadius: '50%',
              margin: '0 auto 3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '4px solid var(--color-surface-high)', boxShadow: 'var(--shadow-md)',
              fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-maroon)',
              position: 'relative', overflow: 'hidden'
            }}>
               {step.number}
            </div>
            <h3 className="display-font" style={{ 
              fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-slate-800)', 
              marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' 
            }}>
              {step.title}
            </h3>
            <p style={{ color: 'var(--color-slate-600)', fontSize: '1rem', lineHeight: '1.8', maxWidth: '300px', margin: '0 auto' }}>
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
