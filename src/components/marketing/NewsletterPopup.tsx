"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Gift } from "lucide-react";

export function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("velora-newsletter");
    if (dismissed) return;
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    localStorage.setItem("velora-newsletter", "true");
    setVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
      setTimeout(dismiss, 3000);
    } catch {
      setSubmitted(true);
      setTimeout(dismiss, 3000);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-lg relative">
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="bg-gray-900 p-8 text-white text-center">
                <Gift className="w-12 h-12 mx-auto mb-4 opacity-80" />
                <h2 className="text-2xl font-bold tracking-wide">DESCUENTO EXCLUSIVO</h2>
                <p className="text-4xl font-black mt-2">15% OFF</p>
                <p className="text-gray-400 mt-2 text-sm">En tu primera compra</p>
              </div>

              <div className="p-8">
                {submitted ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-lg">¡Gracias por suscribirte!</h3>
                    <p className="text-gray-500 text-sm mt-2">
                      Revisa tu correo para obtener tu código de descuento.
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold text-lg text-center mb-2">
                      ¡Únete a la familia VELORA!
                    </h3>
                    <p className="text-gray-500 text-sm text-center mb-6">
                      Suscríbete y recibe ofertas exclusivas, nuevas colecciones y más.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Tu correo electrónico"
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                      <button
                        type="submit"
                        className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
                      >
                        OBTENER MI DESCUENTO
                      </button>
                    </form>
                    <button
                      onClick={dismiss}
                      className="w-full text-center mt-3 text-xs text-gray-400 hover:text-gray-600"
                    >
                      No, gracias. Prefiero pagar precio completo.
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
