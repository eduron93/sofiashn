"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, X, Tag, Pencil, Check, Upload, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  order: number;
  isActive: boolean;
  _count: { products: number; subcategories: number };
}

const emptyForm = { name: "", description: "", image: "", order: "0" };

export function CategoriasClient({ categories: initial }: { categories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) set("image", data.url);
      else setError(data.error ?? "Error al subir imagen");
    } catch {
      setError("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", image: "", order: "0" });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editUploading, setEditUploading] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  const handleEditUpload = async (file: File) => {
    setEditUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) setEditForm((f) => ({ ...f, image: data.url }));
      else setEditError(data.error ?? "Error al subir imagen");
    } catch {
      setEditError("Error al subir imagen");
    } finally {
      setEditUploading(false);
    }
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setCategories((prev) => [...prev, data.category].sort((a, b) => a.order - b.order));
      setForm(emptyForm);
      setShowForm(false);
    } catch {
      setError("Error al crear la categoría");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, description: cat.description ?? "", image: cat.image ?? "", order: cat.order.toString() });
    setEditError("");
  };

  const cancelEdit = () => { setEditingId(null); setEditError(""); };

  const handleEdit = async (id: string) => {
    setEditSaving(true);
    setEditError("");
    try {
      const res = await fetch("/api/admin/categorias", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editForm }),
      });
      const data = await res.json();
      if (!res.ok) { setEditError(data.error); return; }
      setCategories((prev) => prev.map((c) => c.id === id ? data.category : c).sort((a, b) => a.order - b.order));
      setEditingId(null);
    } catch {
      setEditError("Error al guardar");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la categoría "${name}"? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/admin/categorias?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { alert(data.error); return; }
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-500 text-sm mt-1">{categories.length} categorías</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nueva Categoría
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Nueva Categoría</h2>
            <button onClick={() => { setShowForm(false); setError(""); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Nombre *</label>
              <input
                type="text" required value={form.name} onChange={(e) => set("name", e.target.value)}
                placeholder="Ej: Mujeres"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Orden</label>
              <input
                type="number" min="0" value={form.order} onChange={(e) => set("order", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Descripción</label>
              <input
                type="text" value={form.description} onChange={(e) => set("description", e.target.value)}
                placeholder="Descripción opcional"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Imagen</label>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }} />
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-colors disabled:opacity-50">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Subiendo..." : "Subir imagen"}
                </button>
                {form.image && (
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                    <button type="button" onClick={() => set("image", "")} className="text-xs text-red-500 hover:text-red-700">
                      Quitar
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-1">
              <button
                type="button" onClick={() => { setShowForm(false); setError(""); setForm(emptyForm); }}
                className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit" disabled={saving}
                className="flex-1 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60"
              >
                {saving ? "Creando..." : "Crear Categoría"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {categories.length === 0 && !showForm ? (
          <div className="text-center py-16">
            <Tag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No hay categorías. Crea la primera.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Nombre</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Slug</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Subcategorías</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Productos</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Orden</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) =>
                editingId === cat.id ? (
                  /* — Fila en modo edición — */
                  <tr key={cat.id} className="bg-blue-50/40">
                    <td className="px-6 py-3" colSpan={6}>
                      <div className="space-y-3">
                        {editError && <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-1">{editError}</p>}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Nombre *</label>
                            <input
                              type="text" required value={editForm.name}
                              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Descripción</label>
                            <input
                              type="text" value={editForm.description}
                              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Imagen</label>
                            <input ref={editFileRef} type="file" accept="image/*" className="hidden"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleEditUpload(f); e.target.value = ""; }} />
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => editFileRef.current?.click()} disabled={editUploading}
                                className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60">
                                {editUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                {editUploading ? "Subiendo..." : "Subir"}
                              </button>
                              {editForm.image && (
                                <>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={editForm.image} alt="" className="w-8 h-8 rounded object-cover" />
                                  <button type="button" onClick={() => setEditForm((f) => ({ ...f, image: "" }))} className="text-gray-400 hover:text-red-500">
                                    <X className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Orden</label>
                            <input
                              type="number" min="0" value={editForm.order}
                              onChange={(e) => setEditForm((f) => ({ ...f, order: e.target.value }))}
                              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button onClick={cancelEdit} className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition-colors">
                            <X className="w-3 h-3" /> Cancelar
                          </button>
                          <button onClick={() => handleEdit(cat.id)} disabled={editSaving}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs hover:bg-gray-800 transition-colors disabled:opacity-60">
                            <Check className="w-3 h-3" /> {editSaving ? "Guardando..." : "Guardar"}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  /* — Fila normal — */
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {cat.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cat.image} alt="" className="w-8 h-8 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        )}
                        <span className="font-medium text-gray-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">{cat.slug}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cat._count.subcategories}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cat._count.products}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cat.order}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          disabled={cat._count.products > 0}
                          title={cat._count.products > 0 ? "Tiene productos asociados" : "Eliminar"}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
