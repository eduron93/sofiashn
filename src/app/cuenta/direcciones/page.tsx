"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Plus, Trash2, Star } from "lucide-react";

interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

const emptyForm = { name: "", phone: "", street: "", city: "", state: "", zipCode: "", country: "Honduras", isDefault: false };

export default function DireccionesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    fetch("/api/cuenta/direcciones")
      .then((r) => r.json())
      .then((d) => setAddresses(d.addresses ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/cuenta/direcciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch {
      setError("Error al guardar la dirección");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta dirección?")) return;
    await fetch(`/api/cuenta/direcciones?id=${id}`, { method: "DELETE" });
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const set = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/cuenta" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Mis Direcciones</h1>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" /> Agregar
            </button>
          )}
        </div>

        {/* Formulario */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 mb-4">
            <h2 className="font-semibold text-gray-900 mb-4">Nueva Dirección</h2>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-4">{error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Nombre completo", key: "name", col: 2 },
                { label: "Teléfono", key: "phone", col: 1 },
                { label: "País", key: "country", col: 1 },
                { label: "Dirección / Calle", key: "street", col: 2 },
                { label: "Ciudad", key: "city", col: 1 },
                { label: "Departamento / Estado", key: "state", col: 1 },
                { label: "Código postal", key: "zipCode", col: 1 },
              ].map((field) => (
                <div key={field.key} className={field.col === 2 ? "sm:col-span-2" : ""}>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{field.label}</label>
                  <input
                    type="text"
                    required
                    value={(form as any)[field.key]}
                    onChange={(e) => set(field.key, e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              ))}
            </div>

            <label className="flex items-center gap-2 mt-4 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => set("isDefault", e.target.checked)}
                className="w-4 h-4 accent-gray-900"
              />
              <span className="text-sm text-gray-700">Establecer como dirección predeterminada</span>
            </label>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(""); setForm(emptyForm); }}
                className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar Dirección"}
              </button>
            </div>
          </form>
        )}

        {/* Lista de direcciones */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse" />)}
          </div>
        ) : addresses.length === 0 && !showForm ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No tienes direcciones guardadas</p>
            <p className="text-gray-400 text-sm mt-1">Agrega una dirección para agilizar tus compras</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-block mt-6 bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Agregar Dirección
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white rounded-2xl p-5 border border-gray-100 flex justify-between gap-4">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{addr.name}</p>
                      {addr.isDefault && (
                        <span className="flex items-center gap-1 text-[10px] font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          <Star className="w-2.5 h-2.5" /> Predeterminada
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{addr.street}</p>
                    <p className="text-sm text-gray-500">{addr.city}, {addr.state} {addr.zipCode}</p>
                    <p className="text-sm text-gray-500">{addr.country} · {addr.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 h-fit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
