import Link from "next/link";
import { Heart, Star, Shield, Leaf, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Nosotros | SOFIAS HN",
  description: "Conoce la historia y valores de SOFIAS HN, tu tienda de moda premium.",
};

const values = [
  {
    icon: Star,
    title: "Calidad Premium",
    desc: "Cada prenda pasa por un riguroso control de calidad antes de llegar a tus manos.",
  },
  {
    icon: Heart,
    title: "Hecho con Pasión",
    desc: "Amamos la moda y eso se refleja en cada detalle de nuestra colección.",
  },
  {
    icon: Shield,
    title: "Confianza Total",
    desc: "Compras seguras, envíos confiables y atención al cliente siempre disponible.",
  },
  {
    icon: Leaf,
    title: "Moda Responsable",
    desc: "Trabajamos con proveedores comprometidos con prácticas sostenibles y éticas.",
  },
];

const stats = [
  { value: "5,000+", label: "Clientes satisfechos" },
  { value: "150+",   label: "Productos disponibles" },
  { value: "98%",    label: "Calificación positiva" },
  { value: "2+",     label: "Años de experiencia" },
];

export default function NosotrosPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gray-900 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold tracking-[0.4em] text-gray-400 uppercase mb-4">Nuestra historia</p>
          <h1 className="text-5xl font-bold tracking-tight mb-6">Somos SOFIAS HN</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Nacimos con una misión simple: hacer que la moda de calidad sea accesible para todos.
            Creemos que vestir bien no debería ser un lujo, sino una experiencia que todos merecen disfrutar.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-20">

        {/* Historia */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">¿Quiénes somos?</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-5">Una marca creada para ti</h2>
            <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
              <p>
                SOFIAS HN nació de la pasión por la moda y el deseo de ofrecer prendas de alta calidad
                a precios justos. Desde nuestros inicios, nos hemos dedicado a seleccionar cuidadosamente
                cada artículo de nuestra colección.
              </p>
              <p>
                Trabajamos directamente con proveedores de confianza para garantizar que cada prenda
                que llega a tu puerta cumpla con nuestros altos estándares de calidad, estilo y durabilidad.
              </p>
              <p>
                Hoy, miles de clientes confían en SOFIAS HN para renovar su guardarropa con piezas que
                combinan tendencia, comodidad y calidad.
              </p>
            </div>
          </div>
          <div className="bg-gray-100 rounded-3xl aspect-square overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"
              alt="SOFIAS HN store"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Valores */}
        <div>
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Lo que nos mueve</p>
            <h2 className="text-3xl font-bold text-gray-900">Nuestros valores</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl border border-gray-100 p-6 flex gap-4">
                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
                  <v.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gray-900 text-white rounded-3xl p-10 text-center">
          <h2 className="text-2xl font-bold mb-3">¿Lista para descubrir SOFIAS HN?</h2>
          <p className="text-gray-400 text-sm mb-7 max-w-md mx-auto">
            Explora nuestra colección y encuentra las prendas perfectas para cada ocasión.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold px-7 py-3 rounded-xl text-sm hover:bg-gray-100 transition-colors"
            >
              Ver catálogo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white font-semibold px-7 py-3 rounded-xl text-sm hover:bg-white/10 transition-colors"
            >
              Contáctanos
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
