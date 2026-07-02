import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM ?? "VELORA HN <noreply@sofiashn.com>";
const STORE = process.env.NEXT_PUBLIC_STORE_NAME ?? "VELORA HN";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://sofiashn.com";

export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `¡Bienvenido/a a ${STORE}!`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:#111827;padding:32px;text-align:center;">
            <p style="margin:0;font-size:26px;font-weight:700;letter-spacing:6px;color:#ffffff;">${STORE}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111827;">¡Hola, ${name}! 👋</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
              Tu cuenta en <strong>${STORE}</strong> ha sido creada exitosamente. Ya puedes explorar nuestro catálogo y disfrutar de los mejores precios.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:28px;">
              <tr>
                <td style="padding:8px 0;">
                  <span style="font-size:18px;">🚚</span>
                  <span style="font-size:14px;color:#374151;margin-left:8px;">Envíos rápidos a todo Honduras</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;">
                  <span style="font-size:18px;">🔒</span>
                  <span style="font-size:14px;color:#374151;margin-left:8px;">Pago 100% seguro</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;">
                  <span style="font-size:18px;">⭐</span>
                  <span style="font-size:14px;color:#374151;margin-left:8px;">Moda premium a precios accesibles</span>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="${BASE_URL}/catalogo" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:12px;letter-spacing:0.5px;">
                    Explorar Catálogo →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #f3f4f6;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              © ${new Date().getFullYear()} ${STORE} · <a href="${BASE_URL}" style="color:#9ca3af;">${BASE_URL.replace("https://", "")}</a>
            </p>
            <p style="margin:8px 0 0;font-size:12px;color:#d1d5db;">
              Recibiste este correo porque creaste una cuenta en nuestra tienda.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

export async function sendOrderConfirmationEmail(
  to: string,
  name: string,
  orderNumber: string,
  total: number,
  items: { name: string; quantity: number; price: number }[]
) {
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;">${item.name}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#6b7280;text-align:center;">×${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827;text-align:right;font-weight:600;">L. ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Pedido confirmado ${orderNumber} — ${STORE}`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">

        <tr>
          <td style="background:#111827;padding:32px;text-align:center;">
            <p style="margin:0;font-size:26px;font-weight:700;letter-spacing:6px;color:#ffffff;">${STORE}</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px 40px 32px;">
            <div style="text-align:center;margin-bottom:28px;">
              <div style="display:inline-block;background:#d1fae5;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;">✓</div>
              <h1 style="margin:16px 0 4px;font-size:20px;font-weight:700;color:#111827;">¡Pedido recibido!</h1>
              <p style="margin:0;font-size:14px;color:#6b7280;">Hola ${name}, tu pedido está en proceso.</p>
            </div>

            <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Número de pedido</p>
              <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#111827;font-family:monospace;">${orderNumber}</p>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              ${itemsHtml}
              <tr>
                <td colspan="2" style="padding:14px 0 0;font-size:15px;font-weight:700;color:#111827;">Total</td>
                <td style="padding:14px 0 0;font-size:15px;font-weight:700;color:#111827;text-align:right;">L. ${total.toFixed(2)}</td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="${BASE_URL}/rastrear?q=${orderNumber}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:12px;">
                    Rastrear Pedido →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 40px;border-top:1px solid #f3f4f6;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} ${STORE} · <a href="${BASE_URL}" style="color:#9ca3af;">${BASE_URL.replace("https://", "")}</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
