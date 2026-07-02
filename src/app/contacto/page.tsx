"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react";

interface StoreConfig {
  store_email: string;
  store_phone: string;
  store_address: string;
  social_instagram: string;
  social_facebook: string;
  social_tiktok: string;
  social_whatsapp: string;
}

export default function ContactoPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [config, setConfig] = useState<StoreConfig>({
    store_email: "", store_phone: "", store_address: "",
    social_instagram: "", social_facebook: "", social_tiktok: "", social_whatsapp: "",
  });

  useEffect(() => {
    fetch("/api/config").then(r => r.json()).then(setConfig).catch(() => {});
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    // Simulación — aquí se conectaría a un endpoint real de email
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Contáctanos</h1>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          Estamos aquí para ayudarte. Escríbenos y te responderemos a la brevedad.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900 text-white rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-lg">Información de contacto</h2>

            {config.store_email && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm mt-0.5">{config.store_email}</p>
                </div>
              </div>
            )}

            {(config.store_phone || config.social_whatsapp) && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">WhatsApp</p>
                  <p className="text-sm mt-0.5">{config.store_phone || config.social_whatsapp}</p>
                </div>
              </div>
            )}

            {config.store_address && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Ubicación</p>
                  <p className="text-sm mt-0.5">{config.store_address}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Horario</p>
                <p className="text-sm mt-0.5">Lun–Vie · 9:00am – 6:00pm</p>
                <p className="text-sm text-gray-400">Sáb · 9:00am – 2:00pm</p>
              </div>
            </div>
          </div>

          {/* Redes sociales */}
          {(config.social_instagram || config.social_facebook || config.social_tiktok || config.social_whatsapp) && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Síguenos</p>
              <div className="space-y-3">
                {config.social_instagram && (
                  <a href={config.social_instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-900">Instagram</p>
                      <p className="text-xs text-gray-400 truncate max-w-[160px]">{config.social_instagram}</p>
                    </div>
                  </a>
                )}
                {config.social_facebook && (
                  <a href={config.social_facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-900">Facebook</p>
                      <p className="text-xs text-gray-400 truncate max-w-[160px]">{config.social_facebook}</p>
                    </div>
                  </a>
                )}
                {config.social_tiktok && (
                  <a href={config.social_tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-900">TikTok</p>
                      <p className="text-xs text-gray-400 truncate max-w-[160px]">{config.social_tiktok}</p>
                    </div>
                  </a>
                )}
                {config.social_whatsapp && (
                  <a href={`https://wa.me/${config.social_whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-900">WhatsApp</p>
                      <p className="text-xs text-gray-400">{config.social_whatsapp}</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Formulario */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8">
            {sent ? (
              <div className="text-center py-12">
                <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">¡Mensaje enviado!</h3>
                <p className="text-gray-500 text-sm mt-2">Te responderemos en menos de 24 horas.</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  className="mt-6 text-sm text-gray-900 underline underline-offset-2 hover:opacity-70 transition-opacity"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-semibold text-gray-900 mb-6">Envíanos un mensaje</h2>
                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder="Tu nombre"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="tu@email.com"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                      Asunto *
                    </label>
                    <select
                      required
                      value={form.subject}
                      onChange={(e) => set("subject", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow bg-white"
                    >
                      <option value="">Selecciona un tema</option>
                      <option value="pedido">Consulta sobre mi pedido</option>
                      <option value="devolucion">Devolución o cambio</option>
                      <option value="producto">Información de producto</option>
                      <option value="pago">Problema con el pago</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                      Mensaje *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => set("message", e.target.value)}
                      placeholder="Cuéntanos cómo podemos ayudarte..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" />
                    {sending ? "Enviando..." : "Enviar mensaje"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
