import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ValveQuote | Soluiones en Válvulas Industriales',
  description: 'Plataforma líder para la gestión y cotización de servicios de válvulas. Precisión industrial en tiempo real.',
  keywords: 'válvulas, PSV, control, manuales, cotización, industrial, O&G, mantenimiento',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
