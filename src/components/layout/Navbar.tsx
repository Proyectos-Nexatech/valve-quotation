'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export const Navbar = () => {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['inicio', 'servicios', 'como-funciona', 'beneficios'];
      const scrollPosition = window.scrollY + 150; // Offset para detectar antes de llegar al tope

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            return;
          }
        }
      }
      
      // Si estamos muy arriba, no hay sección activa
      if (window.scrollY < 100) {
        setActiveSection('');
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Ejecutar una vez al inicio
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.25rem 5.5rem',
      position: 'sticky',
      top: 0,
      width: '100%',
      zIndex: 100,
      backgroundColor: 'white',
      borderBottom: '1px solid var(--color-surface-high)',
      boxShadow: '0 1px 1px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h2 className="display-font" style={{ 
          color: 'var(--color-maroon)', fontSize: '1.25rem', fontWeight: 900, 
          textTransform: 'uppercase', letterSpacing: '0.05em' 
        }}>
          VALVE<span style={{ color: '#111111', fontWeight: 400 }}>QUOTE</span>
        </h2>
      </div>
      <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        <Link 
          href="#inicio" 
          className={`nav-link ${activeSection === 'inicio' ? 'active' : ''}`}
          style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-slate-600)', letterSpacing: '0.15em', textTransform: 'uppercase' }}
        >
          INICIO
        </Link>
        <Link 
          href="#servicios" 
          className={`nav-link ${activeSection === 'servicios' ? 'active' : ''}`}
          style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-slate-600)', letterSpacing: '0.15em', textTransform: 'uppercase' }}
        >
          SERVICIOS
        </Link>
        <Link 
          href="#como-funciona" 
          className={`nav-link ${activeSection === 'como-funciona' ? 'active' : ''}`}
          style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-slate-600)', letterSpacing: '0.15em', textTransform: 'uppercase' }}
        >
          CÓMO FUNCIONA
        </Link>
        <Link 
          href="#beneficios" 
          className={`nav-link ${activeSection === 'beneficios' ? 'active' : ''}`}
          style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-slate-600)', letterSpacing: '0.15em', textTransform: 'uppercase' }}
        >
          BENEFICIOS
        </Link>
        <Link 
          href="/login" 
          className="nav-link"
          style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-slate-600)', letterSpacing: '0.15em', textTransform: 'uppercase' }}
        >
          ACCESO
        </Link>
        <Link href="/solicitar" className="btn" style={{ 
          fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase',
          padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-maroon)', color: 'white',
          borderRadius: '2px'
        }}>
          INICIAR COTIZACIÓN
        </Link>
      </div>
    </nav>
  );
};
