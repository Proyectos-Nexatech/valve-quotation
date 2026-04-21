'use client';

import React from 'react';
import { useQuotationStore } from '@/lib/store/useQuotationStore';

export const Step1 = () => {
  const { clientData, setClientData, setStep } = useQuotationStore();

  const [emailError, setEmailError] = React.useState('');

  const isCorporateEmail = (email: string) => {
    if (!email || !email.includes('@')) return false;
    const domain = email.split('@')[1].toLowerCase();
    const blockedDomains = [
      'gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 
      'icloud.com', 'live.com', 'msn.com', 'aol.com',
      'yahoo.es', 'hotmail.es', 'live.com.co'
    ];
    return !blockedDomains.some(blocked => domain.includes(blocked));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isCorporateEmail(clientData.email)) {
      setEmailError('Para cotizaciones industriales es necesario un correo electrónico corporativo.');
      return;
    }

    setEmailError('');
    setStep(2);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="display-font" style={{ fontSize: '2.5rem', color: 'var(--color-midnight)', marginBottom: '1.5rem' }}>Datos del Solicitante</h1>
      <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '3.5rem' }}>Proporciona los datos de contacto y la planta donde se requiere el servicio.</p>

      <form onSubmit={handleNext} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>NOMBRE COMPLETO</label>
          <input 
            type="text" required className="precision-input" placeholder="Ej: Ricardo Castellanos"
            value={clientData.name} onChange={(e) => setClientData({ name: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>EMPRESA</label>
          <input 
            type="text" required className="precision-input" placeholder="Ej: PetroQuímica Industrial"
            value={clientData.company} onChange={(e) => setClientData({ company: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>NIT / IDENTIFICACIÓN FISCAL</label>
          <input 
            type="text" required className="precision-input" placeholder="Ej: 900.123.456-1"
            value={clientData.nit} onChange={(e) => setClientData({ nit: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>CORREO ELECTRÓNICO</label>
          <input 
            type="email" required className="precision-input" placeholder="ejemplo@empresa.com.co"
            style={{ 
              borderColor: emailError ? '#EF4444' : undefined,
              backgroundColor: emailError ? '#FEF2F2' : undefined 
            }}
            value={clientData.email} 
            onChange={(e) => {
              setClientData({ email: e.target.value });
              if (emailError) setEmailError('');
            }}
          />
          {emailError && (
            <p style={{ color: '#EF4444', fontSize: '0.625rem', fontWeight: 700, marginTop: '-0.25rem' }}>
              {emailError}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>TELÉFONO / WHATSAPP</label>
          <input 
            type="tel" required className="precision-input" placeholder="+57 321 000 0000"
            value={clientData.phone} onChange={(e) => setClientData({ phone: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>TIPO DE PLANTA / UBICACIÓN</label>
          <input 
            type="text" required className="precision-input" placeholder="Ej: Planta Refinería Sector Norte"
            value={clientData.plant} onChange={(e) => setClientData({ plant: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>PRIORIDAD DEL SERVICIO</label>
          <select 
            className="precision-input"
            value={clientData.priority} onChange={(e) => setClientData({ priority: e.target.value as any })}
          >
            <option value="Normal">Normal</option>
            <option value="Prioritario">Prioritario</option>
          </select>
        </div>

        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
          <button type="submit" className="btn" style={{ backgroundColor: 'var(--color-midnight)', color: 'white', padding: '1rem 3rem' }}>
            Continuar a Válvulas
          </button>
        </div>
      </form>
    </div>
  );
};
