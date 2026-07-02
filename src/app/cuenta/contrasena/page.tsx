"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CambiarContrasenaPage() {
  const [form, setForm] = useState({ current: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cuenta/contrasena", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.password }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else { setSuccess(true); setForm({ current: "", password: "", confirm: "" }); }
    } catch {
      setError("Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/cuenta" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Cambiar Contraseña</h1>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          {success ? (
            <div className="text-center py-4">
              <p className="text-green-700 font-medium">¡Contraseña actualizada correctamente!</p>
              <Link href="/cuenta" className="inline-block mt-4 text-sm text-gray-500 underline">Volver a mi cuenta</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}
              {[
                { label: "Contraseña actual", key: "current" },
                { label: "Nueva contraseña", key: "password" },
                { label: "Confirmar nueva contraseña", key: "confirm" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">{field.label}</label>
                  <input
                    type="password"
                    required
                    value={(form as any)[field.key]}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors disabled:bg-gray-400"
              >
                {loading ? "Guardando..." : "Cambiar Contraseña"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
