"use client";

import { useState } from "react";
import { Plus, Trash2, Tag } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

export function MarcasClient({ brands: initial }: { brands: Brand[] }) {
  const [brands, setBrands] = useState<Brand[]>(initial);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/admin/marcas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setCreateError(data.error); return; }
      setBrands((prev) => [...prev, { ...data.brand, _count: { products: 0 } }].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
    } catch {
      setCreateError("Error al crear la marca");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la marca "${name}"?`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/marcas?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      setBrands((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert("Error al eliminar la marca");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marcas</h1>
          <p className="text-gray-500 text-sm mt-1">{brands.length} marcas</p>
        </div>
      </div>

      {/* Formulario crear */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Nueva Marca</h2>
        {createError && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-3">{createError}</p>}
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre de la marca..."
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
            {creating ? "Creando..." : "Crear"}
          </button>
        </form>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {brands.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No hay marcas registradas.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Nombre</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Slug</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Productos</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {brands.map((brand) => (
                <tr key={brand.id} className={`hover:bg-gray-50 transition-colors ${deleting === brand.id ? "opacity-40" : ""}`}>
                  <td className="px-6 py-4 font-medium text-gray-900 text-sm">{brand.name}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">{brand.slug}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{brand._count.products}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(brand.id, brand.name)}
                      disabled={deleting === brand.id || brand._count.products > 0}
                      title={brand._count.products > 0 ? "Tiene productos asociados" : "Eliminar"}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
