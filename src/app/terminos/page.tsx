import Link from "next/link";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Términos y Condiciones | VELORA",
  description: "Términos y condiciones de uso de la tienda VELORA.",
};

const sections = [
  {
    title: "1. Aceptación de los términos",
    content: `Al acceder y usar este sitio web, aceptas estar sujeto a estos Términos y Condiciones y a todas las leyes y regulaciones aplicables. Si no estás de acuerdo con alguno de estos términos, tienes prohibido usar o acceder a este sitio.`,
  },
  {
    title: "2. Uso del sitio",
    content: `Este sitio web es para uso personal y no comercial. No puedes modificar, copiar, distribuir, transmitir, mostrar, publicar, vender, licenciar, crear trabajos derivados ni usar el contenido de este sitio con fines comerciales sin autorización expresa de VELORA.`,
  },
  {
    title: "3. Cuenta de usuario",
    content: `Para realizar compras es necesario crear una cuenta. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta. Notifícanos inmediatamente si sospechas de uso no autorizado de tu cuenta.`,
  },
  {
    title: "4. Productos y precios",
    content: `Nos reservamos el derecho de modificar los precios en cualquier momento sin previo aviso. Los precios mostrados incluyen impuestos aplicables. En caso de error en el precio publicado, nos reservamos el derecho de cancelar el pedido y reembolsar el monto pagado.`,
  },
  {
    title: "5. Proceso de compra",
    content: `Al realizar un pedido, declaras que la información proporcionada es veraz y completa. La confirmación de tu pedido se enviará al correo electrónico registrado. VELORA se reserva el derecho de rechazar cualquier pedido por cualquier razón.`,
  },
  {
    title: "6. Envíos y entregas",
    content: `Los tiempos de entrega son estimados y pueden variar según la ubicación y disponibilidad del producto. No somos responsables por retrasos causados por terceros (transportistas, aduanas, etc.). El riesgo de pérdida pasa al comprador una vez entregado al transportista.`,
  },
  {
    title: "7. Devoluciones y cambios",
    content: `Aceptamos devoluciones dentro de los 15 días naturales posteriores a la entrega, siempre que el producto esté en su estado original, sin uso y con etiquetas. Consulta nuestra política de devoluciones completa para más detalles.`,
  },
  {
    title: "8. Limitación de responsabilidad",
    content: `VELORA no será responsable por daños indirectos, incidentales, especiales o consecuentes que resulten del uso o la imposibilidad de usar nuestros productos o servicios. Nuestra responsabilidad máxima se limita al valor del pedido en cuestión.`,
  },
  {
    title: "9. Propiedad intelectual",
    content: `Todo el contenido de este sitio, incluyendo textos, imágenes, logotipos y diseños, es propiedad de VELORA y está protegido por las leyes de derechos de autor. Queda prohibida su reproducción sin autorización escrita.`,
  },
  {
    title: "10. Modificaciones",
    content: `VELORA se reserva el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio. El uso continuado del sitio después de los cambios constituye aceptación de los nuevos términos.`,
  },
  {
    title: "11. Ley aplicable",
    content: `Estos términos se rigen por las leyes de la República de Honduras. Cualquier disputa se resolverá ante los tribunales competentes de Tegucigalpa, Honduras.`,
  },
];

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-2xl mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold">Términos y Condiciones</h1>
          <p className="text-gray-400 text-sm mt-2">Última actualización: junio 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-10 space-y-8">
          <p className="text-gray-600 text-sm leading-relaxed border-l-4 border-gray-900 pl-4">
            Por favor, lee estos Términos y Condiciones detenidamente antes de usar nuestros servicios.
            Al realizar una compra o crear una cuenta en VELORA, aceptas estos términos en su totalidad.
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
            <Link href="/privacidad" className="text-xs text-gray-900 font-medium underline underline-offset-2 hover:opacity-70">
              Ver Política de Privacidad →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
