'use client';

import React from 'react';
import {
  ISASafetyValve,
  ISAGeneralValve,
  ISAPressureVacuumValve,
  ISAControlValve,
  ISABallValve
} from '../icons/ISAValveIcons';

export const Portfolio = () => {
  return (
    <section id="portafolio" style={{
      padding: '8rem 5.5rem',
      backgroundColor: '#F8FAFC',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '6rem' }}>
          <p style={{
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.4em', color: 'var(--color-red-bright)',
            textTransform: 'uppercase', marginBottom: '1rem'
          }}>
            Ingeniería y Excelencia
          </p>
          <h2 className="display-font" style={{
            fontSize: '2.5rem', color: 'var(--color-slate-800)', marginBottom: '1.5rem',
            fontWeight: 900, textTransform: 'uppercase', lineHeight: '1.2'
          }}>
            🛠️ Portafolio de Servicios: <span style={{ color: 'var(--color-maroon)' }}>Mantenimiento de Válvulas Industriales</span>
          </h2>
          <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--color-red-bright)', marginBottom: '2rem' }} />
          <p style={{ fontSize: '1.125rem', color: 'var(--color-slate-600)', maxWidth: '800px', lineHeight: '1.8' }}>
            Nuestra metodología garantiza la integridad mecánica y el cumplimiento de los estándares internacionales más exigentes, asegurando la continuidad operativa y la seguridad de sus procesos.
          </p>
        </div>

        {/* Services List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>

          {/* 1. Válvulas Manuales */}
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '2rem' }}>
            <div style={{ color: 'var(--color-maroon)', backgroundColor: 'white', padding: '1rem', borderRadius: '4px', height: 'fit-content', boxShadow: 'var(--shadow-sm)' }}>
              <ISAGeneralValve size={48} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-slate-800)', marginBottom: '1rem', textTransform: 'uppercase' }}>
                1. Válvulas Manuales (Compuerta, Globo, Bola, Mariposa, Tapón y Antirretorno (cheque)).
              </h3>
              <p style={{ fontWeight: 600, color: 'var(--color-maroon)', marginBottom: '1rem' }}>Mantenimiento preventivo y correctivo de válvulas de aislamiento general.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-slate-700)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Alcance:</h4>
                  <p style={{ color: 'var(--color-slate-600)', fontSize: '0.95rem' }}>Cambio de empaquetaduras, lubricación de vástagos, limpieza de internos y recuperación de superficies de sellado.</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-slate-700)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Normativa Aplicable:</h4>
                  <ul style={{ color: 'var(--color-slate-600)', fontSize: '0.9rem', listStyle: 'none', padding: 0 }}>
                    <li>• API 598</li>
                    <li>• ASME B16.34</li>
                  </ul>
                </div>
              </div>
              <p style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#FFF5F5', borderLeft: '3px solid var(--color-red-bright)', fontSize: '0.9rem', color: 'var(--color-maroon)', fontWeight: 600 }}>
                Pruebas: Shell Test, pruebas de asiento de baja y alta presión.
              </p>
            </div>
          </div>

          {/* 2. Válvulas On/Off */}
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '2rem' }}>
            <div style={{ color: 'var(--color-maroon)', backgroundColor: 'white', padding: '1rem', borderRadius: '4px', height: 'fit-content', boxShadow: 'var(--shadow-sm)' }}>
              <ISABallValve size={48} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-slate-800)', marginBottom: '1rem', textTransform: 'uppercase' }}>
                2. Válvulas On/Off (Actuadores Neumaticos, Electricos)
              </h3>
              <p style={{ fontWeight: 600, color: 'var(--color-maroon)', marginBottom: '1rem' }}>Verificación de operacion y tiempos de respuesta.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-slate-700)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Alcance:</h4>
                  <p style={{ color: 'var(--color-slate-600)', fontSize: '0.95rem' }}>Mantenimiento y pruebas de actuador y cuerpo de valvulas, verificacion de tiempos de fallas.</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-slate-700)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Normativa Aplicable:</h4>
                  <ul style={{ color: 'var(--color-slate-600)', fontSize: '0.9rem', listStyle: 'none', padding: 0 }}>
                    <li>• API 6D</li>
                    <li>• IEC 61508/61511 (SIL)</li>
                  </ul>
                </div>
              </div>
              <p style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#FFF5F5', borderLeft: '3px solid var(--color-red-bright)', fontSize: '0.9rem', color: 'var(--color-maroon)', fontWeight: 600 }}>
                Pruebas: Sellado, Fallas neumáticas y Fallas Eléctricas.
              </p>
            </div>
          </div>

          {/* 3. Válvulas de Presión y Vacío */}
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '2rem' }}>
            <div style={{ color: 'var(--color-maroon)', backgroundColor: 'white', padding: '1rem', borderRadius: '4px', height: 'fit-content', boxShadow: 'var(--shadow-sm)' }}>
              <ISAPressureVacuumValve size={48} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-slate-800)', marginBottom: '1rem', textTransform: 'uppercase' }}>
                3. Válvulas de Presión y Vacío
              </h3>
              <p style={{ fontWeight: 600, color: 'var(--color-maroon)', marginBottom: '1rem' }}>Servicios especializados para tanques de almacenamiento de hidrocarburos o químicos.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-slate-700)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Alcance:</h4>
                  <p style={{ color: 'var(--color-slate-600)', fontSize: '0.95rem' }}>Inspección de elementos internos y verificación de sello.</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-slate-700)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Normativa Aplicable:</h4>
                  <ul style={{ color: 'var(--color-slate-600)', fontSize: '0.9rem', listStyle: 'none', padding: 0 }}>
                    <li>• API 2000</li>
                  </ul>
                </div>
              </div>
              <p style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#FFF5F5', borderLeft: '3px solid var(--color-red-bright)', fontSize: '0.9rem', color: 'var(--color-maroon)', fontWeight: 600 }}>
                Pruebas: Verificación de set-point (presión positiva y vacío) en bancos de baja presión.
              </p>
            </div>
          </div>

          {/* 4. Válvulas de Control */}
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '2rem' }}>
            <div style={{ color: 'var(--color-maroon)', backgroundColor: 'white', padding: '1rem', borderRadius: '4px', height: 'fit-content', boxShadow: 'var(--shadow-sm)' }}>
              <ISAControlValve size={48} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-slate-800)', marginBottom: '1rem', textTransform: 'uppercase' }}>
                4. Válvulas de Control (Proporcionales)
              </h3>
              <p style={{ fontWeight: 600, color: 'var(--color-maroon)', marginBottom: '1rem' }}>Verificacion de cierre de acuerdo a la clase de la valvula.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-slate-700)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Alcance:</h4>
                  <p style={{ color: 'var(--color-slate-600)', fontSize: '0.95rem' }}>Revisión de internos (Trim), diagnóstico de posicionadores inteligentes y mantenimiento de actuadores.</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-slate-700)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Normativa Aplicable:</h4>
                  <ul style={{ color: 'var(--color-slate-600)', fontSize: '0.9rem', listStyle: 'none', padding: 0 }}>
                    <li>• ANSI/FCI 70-2 (Clases II a VI)</li>
                    <li>• ISA S75</li>
                  </ul>
                </div>
              </div>
              <p style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#FFF5F5', borderLeft: '3px solid var(--color-red-bright)', fontSize: '0.9rem', color: 'var(--color-maroon)', fontWeight: 600 }}>
                Pruebas: Calibración de carrera.
              </p>
            </div>
          </div>

          {/* 5. Válvulas de Seguridad y Alivio */}
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '2rem' }}>
            <div style={{ color: 'var(--color-maroon)', backgroundColor: 'white', padding: '1rem', borderRadius: '4px', height: 'fit-content', boxShadow: 'var(--shadow-sm)' }}>
              <ISASafetyValve size={48} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-slate-800)', marginBottom: '1rem', textTransform: 'uppercase' }}>
                5. Válvulas de Seguridad y Alivio (PSV / PRV)
              </h3>
              <p style={{ fontWeight: 600, color: 'var(--color-maroon)', marginBottom: '1rem' }}>Enfoque en la protección de activos y vida humana bajo normatividad de recipientes a presión.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-slate-700)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Alcance:</h4>
                  <p style={{ color: 'var(--color-slate-600)', fontSize: '0.95rem' }}>Desmantelamiento total, inspección de boquillas y discos, rectificado de asientos (lapping) y pruebas de disparo.</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-slate-700)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Normativa Aplicable:</h4>
                  <ul style={{ color: 'var(--color-slate-600)', fontSize: '0.9rem', listStyle: 'none', padding: 0 }}>
                    <li>• ASME Sección VIII / Sección I</li>
                    <li>• API 526</li>
                    <li>• API 527</li>
                  </ul>
                </div>
              </div>
              <p style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#FFF5F5', borderLeft: '3px solid var(--color-red-bright)', fontSize: '0.9rem', color: 'var(--color-maroon)', fontWeight: 600 }}>
                Pruebas de Disparo, Sello y Asentamiento.
              </p>
            </div>
          </div>

        </div>

        {/* Quality Table Section */}
        <div style={{ marginTop: '8rem' }}>
          <h2 className="display-font" style={{
            fontSize: '2rem', color: 'var(--color-slate-800)', marginBottom: '2.5rem',
            fontWeight: 900, textTransform: 'uppercase'
          }}>
            📑 Protocolo de Aseguramiento de Calidad
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: 'var(--shadow-sm)' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-slate-800)', color: 'white', textAlign: 'left' }}>
                <th style={{ padding: '1.25rem', border: '1px solid var(--color-slate-700)' }}>Documento</th>
                <th style={{ padding: '1.25rem', border: '1px solid var(--color-slate-700)' }}>Descripción</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '1rem', border: '1px solid #E2E8F0', fontWeight: 700, color: 'var(--color-maroon)' }}>Reporte As-Found</td>
                <td style={{ padding: '1rem', border: '1px solid #E2E8F0', color: 'var(--color-slate-600)' }}>Estado inicial de la válvula al ingresar al taller.</td>
              </tr>
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                <td style={{ padding: '1rem', border: '1px solid #E2E8F0', fontWeight: 700, color: 'var(--color-maroon)' }}>Certificado de Calibración</td>
                <td style={{ padding: '1rem', border: '1px solid #E2E8F0', color: 'var(--color-slate-600)' }}>Resultados de pruebas finales con trazabilidad.</td>
              </tr>
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                <td style={{ padding: '1rem', border: '1px solid #E2E8F0', fontWeight: 700, color: 'var(--color-maroon)' }}>Ensayos No Destructivos</td>
                <td style={{ padding: '1rem', border: '1px solid #E2E8F0', color: 'var(--color-slate-600)' }}>Reporte de Tintas Penetrantes o Partículas si se realizó recuperación de soldadura.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Environmental Commitment */}
        <div style={{ marginTop: '4rem', padding: '2rem', backgroundColor: 'var(--color-maroon)', color: 'white', borderRadius: '4px' }}>
          <p style={{ fontSize: '1.125rem', fontWeight: 700, textAlign: 'center', margin: 0 }}>
            🌿 Compromiso Ambiental: <span style={{ fontWeight: 400, opacity: 0.9 }}>Todos nuestros procesos de limpieza y prueba cumplen con la gestión responsable de residuos y el control de emisiones fugitivas.</span>
          </p>
        </div>
      </div>
    </section>
  );
};
