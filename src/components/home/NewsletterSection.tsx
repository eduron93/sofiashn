"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {}
    setSent(true);
    setEmail("");
  };

  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            Suscríbete y Recibe 15% OFF
          </h2>
          <p className="mt-3 text-gray-400 leading-relaxed">
            Únete a más de 50,000 personas que ya reciben las mejores ofertas, novedades y tendencias de VELORA directamente en su correo.
          </p>

          {sent ? (
            <div className="mt-8 bg-white/10 rounded-2xl p-6">
              <p className="font-semibold text-lg">¡Gracias por suscribirte!</p>
              <p className="text-gray-400 text-sm mt-1">Revisa tu correo para obtener tu código de descuento.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className="flex-1 bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button
                type="submit"
                className="bg-white text-gray-900 px-6 py-3 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                Suscribirme <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <p className="mt-4 text-xs text-gray-500">
            Sin spam. Cancela cuando quieras. Al suscribirte aceptas nuestra política de privacidad.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
