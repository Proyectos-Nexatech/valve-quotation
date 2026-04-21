import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(request: Request) {
  try {
    const { folio, clientData, items } = await request.json();

    if (!resend) {
      console.warn('RESEND_API_KEY is not configured. Email not sent.');
      return NextResponse.json({ success: true, warning: 'RESEND_API_KEY missing' });
    }

    // Construct the items table rows
    const itemsHtml = items.map((item: any, idx: number) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${idx + 1}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.valveType === 'other' ? 'OTRO' : item.valveType}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.serviceType}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.location}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-size: 0.9em;">
          <strong>Tam:</strong> ${item.nominalSize}<br>
          <strong>Rating:</strong> ${item.rating}<br>
          <strong>Marca:</strong> ${item.brand || 'N/A'}<br>
          <strong>S/N:</strong> ${item.serialNumber || 'N/A'}<br>
          <strong>Montaje/Desmontaje:</strong> ${item.montajeDesmontaje ? '<span style="color: #10B981; font-weight: bold;">SÍ</span>' : 'NO'}
          ${item.technicalNotes ? `<br><br><div style="background-color: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #e2e8f0; font-size: 0.85em;"><strong>Notas/Descripción:</strong><br>${item.technicalNotes.replace(/\n/g, '<br>')}</div>` : ''}
        </td>
      </tr>
    `).join('');

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0F172A;">Nueva Solicitud de Cotización</h2>
        <p>Se ha registrado una nueva solicitud en el sistema con el código <strong>${folio}</strong>.</p>
        
        <div style="background-color: #F8FAFC; padding: 15px; border-left: 4px solid #0066FF; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #0F172A;">Información del Cliente</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 5px;"><strong>Nombre:</strong> ${clientData.name}</li>
            <li style="margin-bottom: 5px;"><strong>Empresa:</strong> ${clientData.company} (NIT: ${clientData.nit})</li>
            <li style="margin-bottom: 5px;"><strong>Email:</strong> ${clientData.email}</li>
            <li style="margin-bottom: 5px;"><strong>Teléfono:</strong> ${clientData.phone}</li>
            <li style="margin-bottom: 5px;"><strong>Planta/Sede:</strong> ${clientData.plant}</li>
            <li style="margin-bottom: 5px;">
              <strong>Prioridad:</strong> 
              <span style="color: ${clientData.priority === 'Prioritario' ? '#EF4444' : '#3B82F6'}; font-weight: bold;">
                ${clientData.priority.toUpperCase()}
              </span>
            </li>
          </ul>
        </div>

        <h3 style="color: #0F172A;">Válvulas Solicitadas (${items.length} ítems)</h3>
        <table style="border-collapse: collapse; width: 100%; text-align: left; margin-bottom: 20px;">
          <thead>
            <tr>
              <th style="padding: 8px; border: 1px solid #ddd; background-color: #F1F5F9; color: #334155;">#</th>
              <th style="padding: 8px; border: 1px solid #ddd; background-color: #F1F5F9; color: #334155;">Tipo</th>
              <th style="padding: 8px; border: 1px solid #ddd; background-color: #F1F5F9; color: #334155;">Servicio</th>
              <th style="padding: 8px; border: 1px solid #ddd; background-color: #F1F5F9; color: #334155;">Cant</th>
              <th style="padding: 8px; border: 1px solid #ddd; background-color: #F1F5F9; color: #334155;">Ubicación</th>
              <th style="padding: 8px; border: 1px solid #ddd; background-color: #F1F5F9; color: #334155;">Detalles</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <p style="font-size: 12px; color: #64748B; margin-top: 30px;">
          Este correo ha sido generado automáticamente por la plataforma de Cotizaciones de Nexatech. Por favor revise el panel de control para más detalles.
        </p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      // Si el dominio no está verificado, usar onboarding@resend.dev como from
      from: 'Nexatech Notificaciones <onboarding@resend.dev>',
      to: ['proyectos@nexatech.com.co'],
      subject: `Nueva Solicitud de Cotización - ${folio} | ${clientData.company}`,
      html: htmlBody,
    });

    if (error) {
      console.error('Error enviando correo de notificación:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Excepción no controlada en notify-solicitud:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
