"use client";

import { useState, useRef } from "react";
import { Save, Store, Truck, CreditCard, Mail, Globe, Lock, Upload, X, Loader2 } from "lucide-react";

const SECTIONS = [
  { id: "tienda", label: "Tienda", icon: Store },
  { id: "envios", label: "Envíos", icon: Truck },
  { id: "pagos", label: "Pagos", icon: CreditCard },
  { id: "email", label: "Email", icon: Mail },
  { id: "seo", label: "SEO", icon: Globe },
  { id: "seguridad", label: "Seguridad", icon: Lock },
];

interface Props {
  settings: Record<string, string>;
}

export function ConfiguracionClient({ settings: initial }: Props) {
  const [active, setActive] = useState("tienda");
  const [settings, setSettings] = useState<Record<string, string>>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  const set = (key: string, value: string) => setSettings((s) => ({ ...s, [key]: value }));

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) set("store_logo", data.url);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const field = (key: string, label: string, placeholder = "", type = "text") => (
    <div key={key}>
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</label>
      <input
        type={type}
        value={settings[key] ?? ""}
        onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
    </div>
  );

  const textarea = (key: string, label: string, placeholder = "") => (
    <div key={key}>
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</label>
      <textarea
        rows={3}
        value={settings[key] ?? ""}
        onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
      />
    </div>
  );

  const toggle = (key: string, label: string, description?: string) => (
    <div key={key} className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => set(key, settings[key] === "true" ? "false" : "true")}
        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 mt-0.5 ${settings[key] === "true" ? "bg-gray-900" : "bg-gray-200"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings[key] === "true" ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-500 text-sm mt-1">Ajustes generales de la tienda</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
            saved ? "bg-green-600 text-white" : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? "¡Guardado!" : saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <nav className="w-44 flex-shrink-0">
          <ul className="space-y-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  onClick={() => setActive(id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active === id ? "bg-gray-900 text-white font-medium" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          {active === "tienda" && (
            <>
              <h2 className="font-semibold text-gray-900 mb-2">Información de la tienda</h2>
              {field("store_name", "Nombre de la tienda", "SOFIAS HN")}
              {field("store_email", "Email de contacto", "hola@velora.mx", "email")}
              {field("store_phone", "Teléfono", "+504 9999-9999", "tel")}
              {field("store_address", "Dirección", "Tegucigalpa, Honduras")}
              {/* Logo upload */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Logo de la tienda</label>
                <input ref={logoRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); e.target.value = ""; }} />
                <div className="flex items-center gap-4">
                  {settings.store_logo ? (
                    <div className="relative w-24 h-16 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={settings.store_logo} alt="Logo" className="max-w-full max-h-full object-contain p-1" />
                      <button type="button" onClick={() => set("store_logo", "")}
                        className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-300">
                      <Store className="w-6 h-6" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <button type="button" onClick={() => logoRef.current?.click()} disabled={uploadingLogo}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60">
                      {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploadingLogo ? "Subiendo..." : "Subir imagen"}
                    </button>
                    <p className="text-xs text-gray-400">PNG, JPG o SVG · Máx 5 MB</p>
                  </div>
                </div>
              </div>
              {field("store_currency", "Moneda", "LPS")}
              {textarea("store_description", "Descripción de la tienda", "Moda premium para mujeres modernas...")}
            </>
          )}

          {active === "envios" && (
            <>
              <h2 className="font-semibold text-gray-900 mb-2">Configuración de envíos</h2>
              {field("shipping_free_threshold", "Compra mínima para envío gratis (L)", "1500")}
              {field("shipping_standard_price", "Precio de envío estándar (L)", "99")}
              {field("shipping_express_price", "Precio de envío express (L)", "199")}
              {field("shipping_estimated_days", "Días estimados (estándar)", "3-5 días hábiles")}
              {field("shipping_express_days", "Días estimados (express)", "1-2 días hábiles")}
              <div className="pt-2 space-y-4 border-t border-gray-50">
                {toggle("shipping_free_enabled", "Envío gratis disponible", "Activar opción de envío gratuito según monto mínimo")}
                {toggle("shipping_express_enabled", "Envío express disponible", "Mostrar opción de envío rápido al checkout")}
                {toggle("shipping_pickup_enabled", "Recoger en tienda", "Permitir que el cliente recoja su pedido en sucursal")}
              </div>
            </>
          )}

          {active === "pagos" && (
            <>
              <h2 className="font-semibold text-gray-900 mb-2">Métodos de pago</h2>
              <div className="space-y-4">
                {toggle("payment_cod_enabled", "Pago contra entrega", "Aceptar efectivo al momento de entrega")}
                {toggle("payment_transfer_enabled", "Transferencia bancaria", "Aceptar transferencias y depósitos bancarios")}
                {toggle("payment_card_enabled", "Tarjeta de crédito/débito", "Habilitar pago con tarjeta")}
              </div>
              <div className="pt-4 border-t border-gray-50 space-y-4">
                {field("payment_bank_name", "Banco", "Banco Atlántida")}
                {field("payment_bank_account", "Número de cuenta", "0000-0000-0000")}
                {field("payment_bank_holder", "Titular de la cuenta", "SOFIAS HN S.A.")}
              </div>
            </>
          )}

          {active === "email" && (
            <>
              <h2 className="font-semibold text-gray-900 mb-2">Configuración de email</h2>
              {field("email_from_name", "Nombre del remitente", "SOFIAS HN")}
              {field("email_from_address", "Email remitente", "no-reply@velora.mx", "email")}
              {field("email_smtp_host", "SMTP Host", "smtp.gmail.com")}
              {field("email_smtp_port", "SMTP Puerto", "587")}
              {field("email_smtp_user", "Usuario SMTP", "tu@gmail.com", "email")}
              {field("email_smtp_pass", "Contraseña SMTP", "••••••••", "password")}
              <div className="pt-2 border-t border-gray-50 space-y-4">
                {toggle("email_order_confirm", "Email de confirmación de pedido", "Enviar email cuando se realice un pedido")}
                {toggle("email_order_shipped", "Email de pedido enviado", "Notificar al cliente cuando su pedido sea despachado")}
                {toggle("email_newsletter", "Newsletter activo", "Permitir suscripciones al boletín")}
              </div>
            </>
          )}

          {active === "seo" && (
            <>
              <h2 className="font-semibold text-gray-900 mb-2">SEO y redes sociales</h2>
              {field("seo_title", "Título del sitio", "SOFIAS HN — Moda Premium")}
              {textarea("seo_description", "Meta descripción", "Descubre la colección más exclusiva de moda femenina en Honduras...")}
              {field("seo_keywords", "Palabras clave", "moda, ropa, mujer, Honduras, premium")}
              {field("seo_og_image", "Imagen Open Graph (URL)", "https://...")}
              <div className="pt-4 border-t border-gray-50 space-y-4">
                {field("social_instagram", "Instagram", "@velora_hn")}
                {field("social_facebook", "Facebook", "facebook.com/veloraHN")}
                {field("social_tiktok", "TikTok", "@velora_hn")}
                {field("social_whatsapp", "WhatsApp", "+504 9999-9999", "tel")}
              </div>
            </>
          )}

          {active === "seguridad" && (
            <>
              <h2 className="font-semibold text-gray-900 mb-2">Seguridad y acceso</h2>
              <div className="space-y-4">
                {toggle("maintenance_mode", "Modo mantenimiento", "El sitio mostrará una página de mantenimiento a los visitantes")}
                {toggle("registration_enabled", "Registro de clientes", "Permitir que nuevos usuarios creen una cuenta")}
                {toggle("reviews_enabled", "Reseñas de productos", "Permitir que los clientes dejen reseñas")}
                {toggle("reviews_require_purchase", "Reseñas solo con compra", "Solo clientes que compraron pueden reseñar")}
                {toggle("guest_checkout", "Compra como invitado", "Permitir checkout sin crear cuenta")}
              </div>
              <div className="pt-4 border-t border-gray-50 space-y-4">
                {field("admin_email", "Email del administrador", "admin@velora.mx", "email")}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-xs text-amber-700 font-medium">Para cambiar la contraseña del administrador, usa la sección Mi Cuenta en el panel.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
