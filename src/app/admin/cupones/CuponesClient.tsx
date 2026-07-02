"use client";

import { useState } from "react";
import { Plus, Trash2, Tag, X, Edit, Loader2 } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minPurchase: number | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  expiresAt: string | Date | null;
}

const emptyForm = {
  code: "",
  description: "",
  type: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
  value: "",
  minPurchase: "",
  usageLimit: "",
  expiresAt: "",
  isActive: true,
};

function toDateInput(val: string | Date | null) {
  if (!val) return "";
  const d = typeof val === "string" ? val : val.toISOString();
  return d.slice(0, 10);
}

export function CuponesClient({ coupons: initial }: { coupons: Coupon[] }) {
  const [coupons, setCoupons] = useState<Coupon[]>(initial);
  const [modal, setModal] = useState<{ open: boolean; editing: Coupon | null }>({ open: false, editing: null });
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => {
    setForm(emptyForm);
    setError("");
    setModal({ open: true, editing: null });
  };

  const openEdit = (c: Coupon) => {
    setForm({
      code: c.code,
      description: c.description ?? "",
      type: c.type,
      value: c.value.toString(),
      minPurchase: c.minPurchase?.toString() ?? "",
      usageLimit: c.usageLimit?.toString() ?? "",
      expiresAt: toDateInput(c.expiresAt),
      isActive: c.isActive,
    });
    setError("");
    setModal({ open: true, editing: c });
  };

  const closeModal = () => {
    setModal({ open: false, editing: null });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const isEditing = !!modal.editing;
    try {
      const res = await fetch("/api/admin/cupones", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEditing ? { id: modal.editing!.id, ...form } : form),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }

      if (isEditing) {
        setCoupons((prev) => prev.map((c) => c.id === modal.editing!.id ? data.coupon : c));
      } else {
        setCoupons((prev) => [data.coupon, ...prev]);
      }
      closeModal();
    } catch {
      setError(isEditing ? "Error al actualizar el cupón" : "Error al crear el cupón");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este cupón?")) return;
    await fetch(`/api/admin/cupones?id=${id}`, { method: "DELETE" });
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await fetch("/api/admin/cupones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, isActive: !isActive } : c));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cupones</h1>
          <p className="text-gray-500 text-sm mt-1">{coupons.length} cupones</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo Cupón
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Código</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Descuento</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Usos</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Vence</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Estado</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <Tag className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No hay cupones creados</p>
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {c.code}
                    </span>
                    {c.description && <p className="text-xs text-gray-400 mt-1">{c.description}</p>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {c.type === "PERCENTAGE" ? `${c.value}%` : `L ${c.value.toFixed(2)}`}
                    {c.minPurchase !== null && (
                      <p className="text-xs text-gray-400">Mín. L {c.minPurchase.toFixed(2)}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {c.usageCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}
                    {c.usageLimit !== null && c.usageCount >= c.usageLimit && (
                      <p className="text-xs text-red-400">Agotado</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {c.expiresAt
                      ? (() => {
                          const exp = new Date(c.expiresAt!);
                          const expired = exp < new Date();
                          return (
                            <span className={expired ? "text-red-400" : ""}>
                              {exp.toLocaleDateString("es-HN")}
                              {expired && <span className="block text-xs">Vencido</span>}
                            </span>
                          );
                        })()
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(c.id, c.isActive)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                        c.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {c.isActive ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal crear / editar */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {modal.editing ? "Editar Cupón" : "Nuevo Cupón"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4">
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-4">{error}</p>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Código *</label>
                  <input
                    type="text"
                    required
                    placeholder="VERANO20"
                    value={form.code}
                    onChange={(e) => set("code", e.target.value.toUpperCase())}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Descripción</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Tipo *</label>
                  <select
                    value={form.type}
                    onChange={(e) => set("type", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="PERCENTAGE">Porcentaje (%)</option>
                    <option value="FIXED">Monto fijo (L)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Valor {form.type === "PERCENTAGE" ? "(%)" : "(L)"} *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.value}
                    onChange={(e) => set("value", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Compra mínima (L)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Opcional"
                    value={form.minPurchase}
                    onChange={(e) => set("minPurchase", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Límite de usos</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Sin límite"
                    value={form.usageLimit}
                    onChange={(e) => set("usageLimit", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Fecha de vencimiento</label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => set("expiresAt", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => set("isActive", e.target.checked)}
                    className="w-4 h-4 accent-gray-900"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer">Activo</label>
                </div>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit as unknown as React.MouseEventHandler}
                disabled={saving}
                className="flex-1 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {modal.editing ? "Guardar cambios" : "Crear Cupón"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
