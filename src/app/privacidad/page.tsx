import Link from "next/link";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Política de Privacidad | SOFIAS HN",
  description: "Política de privacidad y tratamiento de datos personales de SOFIAS HN.",
};

const sections = [
  {
    title: "1. Información que recopilamos",
    content: `Recopilamos información que nos proporcionas directamente, como nombre, correo electrónico, dirección de entrega y datos de pago al crear una cuenta o realizar una compra. También recopilamos automáticamente datos de uso del sitio como dirección IP, tipo de navegador y páginas visitadas.`,
  },
  {
    title: "2. Uso de la información",
    content: `Utilizamos tu información para procesar pedidos y pagos, enviar confirmaciones y actualizaciones de tu pedido, responder tus consultas de servicio al cliente, enviarte comunicaciones de marketing (solo si lo autorizas), mejorar nuestros servicios y prevenir fraudes.`,
  },
  {
    title: "3. Compartir información",
    content: `No vendemos, alquilamos ni compartimos tu información personal con terceros para sus propios fines. Compartimos datos únicamente con proveedores de servicios necesarios para operar nuestro negocio (procesadores de pago, empresas de envío), siempre bajo acuerdos de confidencialidad.`,
  },
  {
    title: "4. Cookies",
    content: `Usamos cookies para mejorar tu experiencia en el sitio, recordar tus preferencias, mantener tu sesión activa y analizar el tráfico web. Puedes controlar el uso de cookies desde la configuración de tu navegador, aunque esto puede afectar la funcionalidad del sitio.`,
  },
  {
    title: "5. Seguridad de los datos",
    content: `Implementamos medidas de seguridad técnicas y organizativas para proteger tu información contra acceso no autorizado, alteración, divulgación o destrucción. Los datos de pago se procesan mediante protocolos encriptados y no almacenamos números de tarjeta de crédito.`,
  },
  {
    title: "6. Retención de datos",
    content: `Conservamos tu información personal mientras tu cuenta esté activa o según sea necesario para prestarte servicios. Puedes solicitar la eliminación de tu cuenta y datos asociados en cualquier momento contactando a nuestro equipo de soporte.`,
  },
  {
    title: "7. Tus derechos",
    content: `Tienes derecho a acceder a tu información personal, corregir datos inexactos, solicitar la eliminación de tus datos, oponerte al tratamiento de tu información y retirar el consentimiento para comunicaciones de marketing. Para ejercer estos derechos, contáctanos.`,
  },
  {
    title: "8. Menores de edad",
    content: `Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente información personal de menores. Si eres padre o tutor y crees que tu hijo nos ha proporcionado información, contáctanos para que podamos eliminarla.`,
  },
  {
    title: "9. Enlaces externos",
    content: `Nuestro sitio puede contener enlaces a sitios web de terceros. No somos responsables de las prácticas de privacidad de esos sitios. Te recomendamos revisar las políticas de privacidad de cualquier sitio externo que visites.`,
  },
  {
    title: "10. Cambios a esta política",
    content: `Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos sobre cambios significativos mediante un aviso en el sitio o por correo electrónico. El uso continuado del sitio tras los cambios implica tu aceptación.`,
  },
  {
    title: "11. Contacto",
    content: `Si tienes preguntas sobre esta política o sobre el tratamiento de tus datos, puedes contactarnos a través de nuestra página de contacto. Responderemos en un plazo máximo de 5 días hábiles.`,
  },
];

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-2xl mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold">Política de Privacidad</h1>
          <p className="text-gray-400 text-sm mt-2">Última actualización: junio 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-10 space-y-8">
          <p className="text-gray-600 text-sm leading-relaxed border-l-4 border-gray-900 pl-4">
            En SOFIAS HN nos tomamos muy en serio la privacidad de tus datos. Esta política explica qué
            información recopilamos, cómo la usamos y qué derechos tienes sobre ella.
          </p>

          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="font-bold text-gray-900 mb-2">{s.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{s.content}</p>
            </div>
          ))}

          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row gap-3 justify-between items-center">
            <p className="text-xs text-gray-400">
              ¿Tienes preguntas? <Link href="/contacto" className="underline hover:text-gray-700">Contáctanos</Link>
            </p>
            <Link href="/terminos" className="text-xs text-gray-900 font-medium underline underline-offset-2 hover:opacity-70">
              Ver Términos y Condiciones →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
