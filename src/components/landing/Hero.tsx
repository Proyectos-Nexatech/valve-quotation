'use client';

import React from 'react';
import Link from 'next/link';

export const Hero = () => {
  return (
    <section id="inicio" style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      padding: '6rem 5.5rem',
      backgroundColor: '#520101', // Deep Maroon from Reference Image 2
      backgroundImage: 'linear-gradient(to right, #520101 0%, #3a0101 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle Vignette */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, transparent 0%, rgba(0,0,0,0.3) 100%)',
        zIndex: 1
      }} />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px' }}>

        
        <h1 className="display-font" style={{ 
          fontSize: '5rem', lineHeight: '0.9', color: 'white', marginBottom: '2.5rem', 
          fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em'
        }}>
          SOLUCIONES DE <br />
          <span style={{ color: 'var(--color-red-bright)' }}>INGENIERÍA PARA</span> <br />
          VÁLVULAS INDUSTRIALES
        </h1>
        
        <p style={{ fontSize: '1.125rem', lineHeight: '1.6', color: 'rgba(255,255,255,1)', marginBottom: '3.5rem', maxWidth: '600px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
          Optimice sus procesos industriales con nuestro sistema de cotización. Soporte técnico especializado de alta precisión.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/solicitar" className="btn" style={{ 
            backgroundColor: 'white', color: 'var(--color-maroon)', padding: '1rem 2.5rem', 
            borderRadius: '2px', fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase',
            display: 'inline-flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.3s ease',
            border: '2px solid white'
          }}>
            Nuestros Servicios <span style={{ fontSize: '1.2rem' }}>›</span>
          </Link>
          
          <Link href="/login" className="btn" style={{ 
            backgroundColor: 'transparent', color: 'white', border: '2px solid white', 
            padding: '1rem 2.5rem', borderRadius: '2px', fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase',
            transition: 'all 0.3s ease'
          }}>
            Acceso Personal
          </Link>

          <button className="btn" style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.2)', 
            padding: '1rem 2.5rem', borderRadius: '2px', fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase',
            transition: 'all 0.3s ease'
          }}>
            Ver Portafolio
          </button>
        </div>
      </div>
    </section>
  );
};
