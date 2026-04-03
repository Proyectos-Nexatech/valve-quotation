import React from 'react';
import { Settings, Droplets, Target } from 'lucide-react';

const FEATURE_DATA = [
  {
    title: 'Válvulas PSV',
    description: 'Inspección, calibración y certificación bajo norma API 527 para alivio de presión profesional.',
    icon: <Settings size={32} />,
  },
  {
    title: 'Válvulas de Control',
    description: 'Diagnóstico avanzado de actuadores y posicionadores con reporte de banda muerta especializado.',
    icon: <Droplets size={32} />,
  },
  {
    title: 'Válvulas Manuales',
    description: 'Mantenimiento preventivo, cambio de empaquetaduras y pruebas de estanqueidad certificadas.',
    icon: <Target size={32} />,
  }
];

export const Features = () => {
  return (
    <section id="servicios" style={{
      padding: '10rem 5.5rem',
      backgroundColor: 'white',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{ marginBottom: '6rem', textAlign: 'center' }}>
        <p style={{ 
          fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.4em', color: 'var(--color-red-bright)', 
          textTransform: 'uppercase', marginBottom: '1rem' 
        }}>
          Nuestras Especialidades
        </p>
        <h2 className="display-font" style={{ 
          fontSize: '3.5rem', color: 'var(--color-slate-800)', marginBottom: '1.5rem', 
          fontWeight: 900, textTransform: 'uppercase' 
        }}>
          Servicios de <span style={{ color: 'var(--color-maroon)' }}>Ingeniería</span>
        </h2>
        <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--color-red-bright)', margin: '0 auto' }} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '4rem'
      }}>
        {FEATURE_DATA.map((item, idx) => (
          <div key={idx} style={{
            backgroundColor: 'white',
            padding: '4rem 3rem',
            borderRadius: '2px',
            boxShadow: 'var(--shadow-float)',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            borderTop: '5px solid transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderTopColor = 'var(--color-maroon)';
            e.currentTarget.style.transform = 'translateY(-10px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderTopColor = 'transparent';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <div style={{ 
              color: 'var(--color-maroon)', marginBottom: '2.5rem', 
              backgroundColor: '#F8FAFC', padding: '1.5rem', borderRadius: '50%' 
            }}>
              {item.icon}
            </div>
            <h3 className="display-font" style={{ 
              fontSize: '1.25rem', color: 'var(--color-slate-800)', marginBottom: '1.5rem', 
              fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' 
            }}>
              {item.title}
            </h3>
            <p style={{ color: 'var(--color-slate-600)', fontSize: '1rem', lineHeight: '1.8' }}>
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
