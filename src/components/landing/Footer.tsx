import React from 'react';
import Link from 'next/link';

export const MainCTA = () => {
  return (
    <section style={{
      padding: '12rem 5.5rem',
      backgroundColor: '#111111',
      color: 'white',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(circle at 50% 50%, var(--color-maroon) 0%, transparent 70%)',
        opacity: 0.3
      }} />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <p style={{ 
          fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.4em', color: 'var(--color-red-bright)', 
          textTransform: 'uppercase', marginBottom: '1.5rem' 
        }}>
          Inicie su Proceso Hoy
        </p>
        <h2 className="display-font" style={{ 
          fontSize: '4.5rem', marginBottom: '2rem', maxWidth: '900px', margin: '0 auto 2rem', 
          fontWeight: 900, textTransform: 'uppercase' 
        }}>
          ¿TIENE UNA <span style={{ color: 'var(--color-red-bright)' }}>PARADA DE PLANTA</span> PRÓXIMA?
        </h2>
        <p style={{ fontSize: '1.25rem', opacity: 0.7, marginBottom: '4rem', maxWidth: '650px', margin: '0 auto 4rem', lineHeight: '1.8' }}>
          Optimice sus tiempos de planeación y contratación con nuestra plataforma.
        </p>
        
        <Link href="/solicitar" className="btn" style={{ 
          padding: '1.5rem 4rem', fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase',
          backgroundColor: 'var(--color-maroon)', color: 'white', borderRadius: '2px', 
          boxShadow: '0 20px 25px -5px rgba(126, 1, 1, 0.4)'
        }}>
          Solicitar Cotización Técnica
        </Link>
      </div>
    </section>
  );
};

export const Footer = () => {
  return (
    <footer style={{
      padding: '8rem 5.5rem 4rem',
      backgroundColor: '#0a0a0a',
      color: 'white',
      display: 'grid',
      gridTemplateColumns: '1.5fr repeat(2, 1fr)',
      gap: '5rem'
    }}>
      <div>
        <h3 className="display-font" style={{ 
          fontSize: '1.5rem', color: 'var(--color-maroon)', marginBottom: '1.5rem', 
          fontWeight: 900, textTransform: 'uppercase' 
        }}>
          VALVE<span style={{ color: 'white', fontWeight: 400 }}>QUOTE</span>
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.8', maxWidth: '300px' }}>
          TECHNICAL PRECISION & INDUSTRIAL AUTHORITY. PROPIEDAD DE BUSTILLO INGENIERIA SAS. - 2026.
        </p>
        <div style={{ marginTop: '3rem', width: '40px', height: '2px', backgroundColor: 'var(--color-red-bright)' }} />
      </div>
      
      <div>
        <h4 className="display-font" style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.2em', marginBottom: '2rem', color: 'white' }}>NAVEGACIÓN</h4>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <li><Link href="/" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', transition: 'color 0.3s' }}>INICIO</Link></li>
          <li><Link href="#servicios" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>SERVICIOS</Link></li>
          <li><Link href="#portafolio" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>PORTAFOLIO</Link></li>
          <li><Link href="#como-funciona" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>CÓMO FUNCIONA</Link></li>
          <li><Link href="/solicitar" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>NUEVA SOLICITUD</Link></li>
          <li><Link href="/login" style={{ fontSize: '0.875rem', color: 'var(--color-red-bright)', fontWeight: 700 }}>ACCESO PERSONAL</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="display-font" style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.2em', marginBottom: '2rem', color: 'white' }}>LEGAL</h4>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <li><Link href="#" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>PRIVACIDAD</Link></li>
          <li><Link href="#" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>TÉRMINOS</Link></li>
        </ul>
      </div>

      <div style={{ gridColumn: 'span 3', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '3rem', marginTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>© 2026 VALVEQUOTE. TODOS LOS DERECHOS RESERVADOS.</p>
         <div style={{ display: 'flex', gap: '2rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-maroon)' }}>
            <span>TWITTER</span>
            <span>LINKEDIN</span>
            <span>WHATSAPP</span>
         </div>
      </div>
    </footer>
  );
};
