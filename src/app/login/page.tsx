'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, User, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex' }}>
      {/* Left side - Visual branding */}
      <div style={{ flex: 1.2, backgroundColor: 'var(--color-midnight)', padding: '6rem', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
         <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.8
         }} />
         
         <div style={{ position: 'relative', zIndex: 10 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '6rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
              <ArrowLeft size={18} /> Volver al Inicio
            </Link>
            <h1 className="display-font" style={{ fontSize: '3rem', lineHeight: '1.1', marginBottom: '1.5rem' }}>Acceso al Sistema <br /> <span style={{ color: 'var(--color-orange)' }}>ValveQuote</span></h1>
            <p style={{ opacity: 0.6, fontSize: '1.125rem', maxWidth: '400px' }}>Gestión centralizada de mantenimientos, tarifarios y órdenes de servicio industrial.</p>
         </div>

         <div style={{ position: 'relative', zIndex: 10 }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>SOPORTE TÉCNICO INTERNO: admin@industrialflow.com.co</p>
         </div>
      </div>

      {/* Right side - Login form */}
      <div style={{ flex: 1, backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
         <div style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ marginBottom: '3.5rem' }}>
               <h2 className="display-font" style={{ fontSize: '1.5rem', color: 'var(--color-midnight)', marginBottom: '0.5rem' }}>Iniciar Sesión</h2>
               <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>Ingresa tus credenciales de personal autorizado.</p>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
                  <label style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>CORREO INSTITUCIONAL</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="email" required className="precision-input" placeholder="ejemplo@industrialflow.com" 
                      value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                    <User size={18} style={{ position: 'absolute', right: 0, top: '5px', color: 'var(--color-surface-highest)' }} />
                  </div>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
                  <label style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>CONTRASEÑA</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? 'text' : 'password'} required className="precision-input" placeholder="••••••••••••" 
                      value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                    <div 
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 0, top: '5px', color: 'var(--color-surface-highest)', cursor: 'pointer' }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                  </div>
               </div>

               <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Link href="#" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-midnight)' }}>¿Olvidaste tu contraseña?</Link>
               </div>

               <button type="submit" className="btn btn-secondary" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                  Ingresar al Panel <Lock size={16} />
               </button>
            </form>
         </div>
      </div>
    </div>
  );
}
