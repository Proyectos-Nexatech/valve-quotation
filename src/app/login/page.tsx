'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, User, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isRegistering) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (signUpError) throw signUpError;
        alert('Cuenta creada. Por favor verifica tu correo si es necesario.');
        setIsRegistering(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Error en la autenticación');
    } finally {
      setIsLoading(false);
    }
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
            <p style={{ opacity: 0.6, fontSize: '1.125rem', maxWidth: '400px' }}>Gestión centralizada de tarifas para los servicios especializados de Valvulas de Bustillo Ingenieria SAS.</p>
         </div>

          <div style={{ position: 'relative', zIndex: 10 }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>SOPORTE TÉCNICO INTERNO: proyectos@nexatech.com.co</p>
          </div>
      </div>

      {/* Right side - Login form */}
      <div style={{ flex: 1, backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
         <div style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ marginBottom: '3.5rem' }}>
               <h2 className="display-font" style={{ fontSize: '1.5rem', color: 'var(--color-midnight)', marginBottom: '0.5rem' }}>
                 {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
               </h2>
               <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>
                 {isRegistering ? 'Regístrate como personal autorizado de la empresa.' : 'Ingresa tus credenciales de personal autorizado.'}
               </p>
            </div>

            {error && (
              <div style={{ padding: '1rem', backgroundColor: '#FEE2E2', border: '1px solid #EF4444', color: '#B91C1C', borderRadius: '4px', fontSize: '0.75rem', marginBottom: '2rem', fontWeight: 700 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               {isRegistering && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
                    <label style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>NOMBRE COMPLETO</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" required className="precision-input" placeholder="Tu nombre y apellidos" 
                        value={fullName} onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                 </div>
               )}
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

               <button type="submit" disabled={isLoading} className="btn btn-secondary" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                  {isLoading ? 'PROCESANDO...' : isRegistering ? 'Crear mi Cuenta' : 'Ingresar al Panel'} <Lock size={16} />
               </button>

               <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button 
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿Eres nuevo? Solicita tu cuenta aquí'}
                  </button>
               </div>
            </form>
         </div>
      </div>
    </div>
  );
}
