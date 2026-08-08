export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export function getWelcomeEmailTemplate(name: string, confirmUrl: string): EmailTemplate {
  return {
    subject: 'Bienvenido a Soph.ia — Confirmá tu cuenta',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 40px 20px; text-align: center;">
          <h1 style="margin: 0 0 10px; font-size: 28px; font-weight: bold;">Bienvenido a Soph.ia</h1>
          <p style="margin: 0 0 30px; color: #666; font-size: 14px;">Tu Knowledge OS para crear agentes de IA</p>
        </div>

        <div style="padding: 30px 20px; background-color: #f5f5f5; border-radius: 8px; margin: 0 20px 30px;">
          <p style="margin: 0 0 20px; font-size: 16px;">Hola ${escapeHtml(name)},</p>
          <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #333;">
            Gracias por registrarte en Soph.ia. Para completar tu registro, confirmá tu dirección de email haciendo clic en el botón de abajo.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${escapeHtml(confirmUrl)}" style="display: inline-block; padding: 12px 30px; background-color: #5B9BFF; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Confirmar Email</a>
          </div>
          <p style="margin: 20px 0 0; font-size: 12px; color: #999; text-align: center;">O copia este enlace en tu navegador:<br><code style="background-color: #eee; padding: 2px 6px; border-radius: 3px;">${escapeHtml(confirmUrl)}</code></p>
        </div>

        <div style="padding: 20px; font-size: 12px; color: #999; text-align: center; border-top: 1px solid #eee;">
          <p style="margin: 0 0 10px;">Este email fue enviado porque registraste una cuenta en Soph.ia.</p>
          <p style="margin: 0;">Si no fuiste vos, podés ignorar este mensaje.</p>
        </div>
      </div>
    `,
    text: `
Bienvenido a Soph.ia

Hola ${name},

Gracias por registrarte. Para completar tu registro, visitá este enlace:
${confirmUrl}

Si no fuiste vos quien se registró, podés ignorar este mensaje.

Equipo Soph.ia
    `.trim(),
  }
}

export function getPasswordResetTemplate(name: string, resetUrl: string): EmailTemplate {
  return {
    subject: 'Reiniciá tu contraseña en Soph.ia',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 40px 20px; text-align: center;">
          <h1 style="margin: 0 0 10px; font-size: 28px; font-weight: bold;">Reiniciá tu contraseña</h1>
        </div>

        <div style="padding: 30px 20px; background-color: #f5f5f5; border-radius: 8px; margin: 0 20px 30px;">
          <p style="margin: 0 0 20px; font-size: 16px;">Hola ${escapeHtml(name)},</p>
          <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #333;">
            Recibimos una solicitud para reiniciar tu contraseña. Si fuiste vos, hacé clic en el botón de abajo para establecer una nueva contraseña.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${escapeHtml(resetUrl)}" style="display: inline-block; padding: 12px 30px; background-color: #5B9BFF; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Reiniciar Contraseña</a>
          </div>
          <p style="margin: 20px 0 0; font-size: 12px; color: #999;">Este enlace expira en 24 horas.</p>
        </div>

        <div style="padding: 20px; font-size: 12px; color: #999; text-align: center; border-top: 1px solid #eee;">
          <p style="margin: 0 0 10px;">Si no solicitaste reiniciar tu contraseña, ignorá este mensaje.</p>
          <p style="margin: 0;">Tu contraseña no cambió hasta que confirmes esta solicitud.</p>
        </div>
      </div>
    `,
    text: `
Reiniciá tu contraseña

Hola ${name},

Recibimos una solicitud para reiniciar tu contraseña. Visitá este enlace para establecer una nueva contraseña:
${resetUrl}

Este enlace expira en 24 horas.

Si no solicitaste esto, podés ignorar este mensaje.

Equipo Soph.ia
    `.trim(),
  }
}

export function getNotificationTemplate(title: string, message: string): EmailTemplate {
  return {
    subject: `Notificación de Soph.ia: ${title}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 40px 20px; text-align: center;">
          <h1 style="margin: 0 0 10px; font-size: 24px; font-weight: bold;">${escapeHtml(title)}</h1>
        </div>

        <div style="padding: 30px 20px; background-color: #f5f5f5; border-radius: 8px; margin: 0 20px 30px;">
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #333;">${escapeHtml(message)}</p>
        </div>

        <div style="padding: 20px; font-size: 12px; color: #999; text-align: center; border-top: 1px solid #eee;">
          <p style="margin: 0;">Podés ajustar tus preferencias de notificación en tu cuenta de Soph.ia.</p>
        </div>
      </div>
    `,
    text: `
${title}

${message}

Para ajustar tus preferencias de notificación, visitá tu cuenta de Soph.ia.

Equipo Soph.ia
    `.trim(),
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
