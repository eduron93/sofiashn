"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, Image, X, ExternalLink, Edit, Upload, Loader2 } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  mobileImage: string | null;
  link: string | null;
  buttonText: string | null;
  isActive: boolean;
  order: number;
}

const emptyForm = {
  title: "",
  subtitle: "",
  image: "",
  mobileImage: "",
  link: "",
  buttonText: "",
  order: "0",
  isActive: true,
};

export function BannersClient({ banners: initial }: { banners: Banner[] }) {
  const [banners, setBanners] = useState<Banner[]>(initial);
  const [modal, setModal] = useState<{ open: boolean; editing: Banner | null }>({ open: false, editing: null });
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => {
    setForm(emptyForm);
    setError("");
    setModal({ open: true, editing: null });
  };

  const openEdit = (b: Banner) => {
    setForm({
      title: b.title,
      subtitle: b.subtitle ?? "",
      image: b.image,
      mobileImage: b.mobileImage ?? "",
      link: b.link ?? "",
      buttonText: b.buttonText ?? "",
      order: b.order.toString(),
      isActive: b.isActive,
    });
    setError("");
    setModal({ open: true, editing: b });
  };

  const closeModal = () => {
    setModal({ open: false, editing: null });
    setError("");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) set("image", data.url);
      else setError(data.error ?? "Error al subir imagen");
    } catch {
      setError("Error al subir imagen");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const isEditing = !!modal.editing;
      const res = await fetch("/api/admin/banners", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEditing ? { id: modal.editing!.id, ...form } : form),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }

      if (isEditing) {
        setBanners(prev => prev.map(b => b.id === modal.editing!.id ? data.banner : b).sort((a, b) => a.order - b.order));
      } else {
        setBanners(prev => [...prev, data.banner].sort((a, b) => a.order - b.order));
      }
      closeModal();
    } catch {
      setError("Error al guardar el banner");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este banner?")) return;
    await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await fetch("/api/admin/banners", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    setBanners(prev => prev.map(b => b.id === id ? { ...b, isActive: !isActive } : b));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-gray-500 text-sm mt-1">{banners.length} banners</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          <Plus className="w-4 h-4" /> Nuevo Banner
        </button>
      </div>

      {/* Lista de banners */}
      {banners.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Image className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No hay banners creados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {banners.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex gap-4 p-4">
              <div className="w-32 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.image} alt={b.title} className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{b.title}</p>
                    {b.subtitle && <p className="text-xs text-gray-500 mt-0.5">{b.subtitle}</p>}
                    {b.link && (
                      <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />{b.link}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Orden: {b.order}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleToggle(b.id, b.isActive)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${b.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                      {b.isActive ? "Activo" : "Inactivo"}
                    </button>
                    <button onClick={() => openEdit(b)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(b.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal crear/editar */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {modal.editing ? "Editar Banner" : "Nuevo Banner"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Título *</label>
                  <input type="text" required value={form.title} onChange={(e) => set("title", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Subtítulo</label>
                  <input type="text" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>

                {/* Imagen */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Imagen *</label>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                  <div className="flex gap-2">
                    <input type="text" value={form.image} onChange={(e) => set("image", e.target.value)}
                      placeholder="https://... o sube un archivo"
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                      className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 flex-shrink-0">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploading ? "Subiendo..." : "Subir"}
                    </button>
                  </div>
                  {form.image && (
                    <div className="mt-2 w-full h-24 rounded-lg overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Link destino</label>
                  <input type="text" value={form.link} onChange={(e) => set("link", e.target.value)}
                    placeholder="/catalogo/mujeres"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Texto del botón</label>
                  <input type="text" value={form.buttonText} onChange={(e) => set("buttonText", e.target.value)}
                    placeholder="Ver colección"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Orden</label>
                  <input type="number" min="0" value={form.order} onChange={(e) => set("order", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" id="bannerActive" checked={form.isActive}
                    onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 accent-gray-900" />
                  <label htmlFor="bannerActive" className="text-sm text-gray-700 cursor-pointer">Activo</label>
                </div>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button type="button" onClick={closeModal}
                className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSubmit as unknown as React.MouseEventHandler} disabled={saving}
                className="flex-1 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {modal.editing ? "Guardar cambios" : "Crear Banner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
