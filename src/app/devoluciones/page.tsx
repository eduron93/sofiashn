"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCcw, Package, Clock, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

const steps = [
  {
    icon: Package,
    title: "1. Inicia tu solicitud",
    desc: "Contáctanos por WhatsApp o correo con tu número de pedido dentro de los 15 días posteriores a la entrega.",
  },
  {
    icon: CheckCircle,
    title: "2. Aprobación",
    desc: "Revisamos tu solicitud en 1-2 días hábiles y te confirmamos si aplica la devolución o cambio.",
  },
  {
    icon: RefreshCcw,
    title: "3. Envío del producto",
    desc: "Nos envías el producto en su empaque original, sin uso y con etiquetas intactas.",
  },
  {
    icon: Clock,
    title: "4. Reembolso o cambio",
    desc: "Al recibir el artículo procesamos el reembolso en 3-5 días hábiles o enviamos el cambio.",
  },
];

const conditions = [
  "El artículo debe estar sin usar, sin lavar y con todas sus etiquetas originales.",
  "Debe presentarse en su empaque original en buen estado.",
  "La solicitud debe realizarse dentro de los 15 días naturales tras recibir tu pedido.",
  "Incluir el comprobante de compra o número de pedido.",
];

const exceptions = [
  "Ropa interior, trajes de baño y accesorios íntimos (por higiene).",
  "Artículos personalizados o con modificaciones a pedido.",
  "Productos en liquidación o con descuento mayor al 50%.",
  "Artículos dañados por mal uso del cliente.",
];

export default function DevolucionesPage() {
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch("/api/config").then(r => r.json()).then(d => {
      if (d.social_whatsapp) setWhatsapp(d.social_whatsapp);
      if (d.store_email) setEmail(d.store_email);
    }).catch(() => {});
  }, []);

  const contactHref = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}`
    : email ? `mailto:${email}` : "/contacto";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl mb-5">
            <RefreshCcw className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Devoluciones y Cambios</h1>
          <p className="mt-3 text-gray-400 text-lg max-w-xl mx-auto">
            Tu satisfacción es nuestra prioridad. Proceso simple y sin complicaciones.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">

        {/* Plazo destacado */}
        <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="w-8 h-8 text-gray-900" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">15 días para devolver</h2>
            <p className="text-gray-500 mt-1">
              Tienes 15 días naturales desde que recibes tu pedido para solicitar una devolución o cambio sin costo adicional.
            </p>
          </div>
        </div>

        {/* Pasos */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">¿Cómo funciona?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {steps.map((s) => (
              <div key={s.title} className="bg-white rounded-2xl shadow-sm p-6 flex gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  <s.icon className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{s.title}</h3>
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Condiciones y Excepciones */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h2 className="font-bold text-gray-900">Condiciones</h2>
            </div>
            <ul className="space-y-3">
              {conditions.map((c, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-600">
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h2 className="font-bold text-gray-900">No aplica para</h2>
            </div>
            <ul className="space-y-3">
              {exceptions.map((e, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-600">
                  <span className="text-red-400 mt-0.5 shrink-0">✕</span>
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA contacto */}
        <div className="bg-gray-900 text-white rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">¿Listo para iniciar tu solicitud?</h2>
          <p className="text-gray-400 text-sm mb-6">
            Escríbenos con tu número de pedido y te guiamos en el proceso.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={contactHref}
              target={contactHref.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-gray-100 transition-colors"
            >
              Contactar soporte
            </a>
            <Link
              href="/rastrear"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-white/10 transition-colors"
            >
              Rastrear mi pedido
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
