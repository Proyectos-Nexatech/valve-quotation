'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuotationStore } from '@/lib/store/useQuotationStore';
import { Step1 } from '@/components/quotation/Step1';
import { Step2 } from '@/components/quotation/Step2';
import { ConfirmStep } from '@/components/quotation/ConfirmStep';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export default function SolicitarPage() {
  const { step, setStep } = useQuotationStore();

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid var(--color-surface-high)',
        padding: '1.5rem 5.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/" style={{ color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={16} /> Volver
          </Link>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-surface-high)' }} />
          <h2 className="display-font" style={{ fontSize: '1rem', color: 'var(--color-midnight)' }}>
            CONFIGURACIÓN DE SOLICITUD
          </h2>
        </div>

        {/* Horizontal Stepper */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: step === 1 ? 1 : 0.5 }}>
            <span style={{ 
              width: '24px', height: '24px', 
              borderRadius: '50%', backgroundColor: step >= 1 ? 'var(--color-midnight)' : 'transparent',
              border: '1px solid var(--color-midnight)',
              color: step >= 1 ? 'white' : 'var(--color-midnight)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700
            }}>1</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>DATOS</span>
          </div>
          <ChevronRight size={14} opacity={0.3} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: step === 2 ? 1 : 0.5 }}>
            <span style={{ 
              width: '24px', height: '24px', 
              borderRadius: '50%', backgroundColor: step >= 2 ? 'var(--color-midnight)' : 'transparent',
              border: '1px solid var(--color-midnight)',
              color: step >= 2 ? 'white' : 'var(--color-midnight)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700
            }}>2</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>VÁLVULAS</span>
          </div>
          <ChevronRight size={14} opacity={0.3} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: step === 3 ? 1 : 0.5 }}>
            <span style={{ 
              width: '24px', height: '24px', 
              borderRadius: '50%', backgroundColor: step >= 3 ? 'var(--color-midnight)' : 'transparent',
              border: '1px solid var(--color-midnight)',
              color: step >= 3 ? 'white' : 'var(--color-midnight)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700
            }}>3</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>RESUMEN</span>
          </div>
        </div>
      </header>

      {/* Form Content */}
      <main style={{ flex: 1, padding: '4rem 5.5rem' }}>
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <ConfirmStep />}
      </main>
    </div>
  );
}
