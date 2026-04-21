import {
  ISAGeneralValve,
  ISASafetyValve,
  ISABallValve,
  ISAControlValve,
  ISAPressureVacuumValve
} from '../icons/ISAValveIcons';

const FEATURE_DATA = [
  {
    title: 'Válvulas Manuales',
    description: 'Mantenimiento preventivo y correctivo, cambio de empaquetaduras y pruebas de sello segun API-598.',
    icon: <ISAGeneralValve size={32} />,
  },
  {
    title: 'VÁLVULAS ON/OFF',
    description: 'Pruebas de cierre, mantenimiento de actuadorres electricos y neumaticos y verificacion de fallas.',
    icon: <ISABallValve size={32} />,
  },
  {
    title: 'VÁLVULAS PRESIÓN-VACÍO',
    description: 'Pruebas de hermeticidad y calibración de venteos para tanques de almacenamiento e industria.',
    icon: <ISAPressureVacuumValve size={32} />,
  },
  {
    title: 'Válvulas de Control',
    description: 'Calibración de carrera, mantenimiento de actuadores y posicionadores, comprobacion de fallas y pruebas de cierre (seat leakage) conforme a ANSI/FCI 70-2.',
    icon: <ISAControlValve size={32} />,
  },
  {
    title: 'VÁLVULAS DE SEGURIDAD Y/O ALIVIO',
    description: 'Inspección y calibracion, bajo norma API 527 para alivio de presion de procesos.',
    icon: <ISASafetyValve size={32} />,
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
          fontSize: '2.5rem', color: 'var(--color-slate-800)', marginBottom: '1.5rem',
          fontWeight: 900, textTransform: 'uppercase', lineHeight: '1.2'
        }}>
          SERVICIOS DE <span style={{ color: 'var(--color-maroon)' }}>MANTENIMIENTO Y PRUEBAS</span> DE TODO TIPO DE VÁLVULAS INDUSTRIALES
        </h2>
        <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--color-red-bright)', margin: '0 auto' }} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '1.5rem',
        justifyContent: 'center'
      }}>
        {FEATURE_DATA.map((item, idx) => (
          <div key={idx} style={{
            backgroundColor: 'white',
            padding: '2rem 1.5rem',
            borderRadius: '2px',
            boxShadow: 'var(--shadow-float)',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            borderTop: '5px solid transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            minHeight: '380px'
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
