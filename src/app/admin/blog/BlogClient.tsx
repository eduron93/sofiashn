"use client";

import { useState } from "react";
import { Plus, Trash2, FileText, X, Eye, EyeOff } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  image: string | null;
  category: string | null;
  tags: string[];
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  image: "",
  category: "",
  tags: "",
  isPublished: false,
};

export function BlogClient({ posts: initial }: { posts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setPosts((prev) => [data.post, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
    } catch {
      setError("Error al crear el post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este artículo?")) return;
    await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    await fetch("/api/admin/blog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isPublished: !isPublished }),
    });
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, isPublished: !isPublished } : p));
  };

  const published = posts.filter((p) => p.isPublished).length;
  const drafts = posts.length - published;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="text-gray-500 text-sm mt-1">
            {published} publicados · {drafts} borradores
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo Artículo
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Nuevo Artículo</h2>
            <button onClick={() => { setShowForm(false); setError(""); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Título *</label>
                <input type="text" required value={form.title} onChange={(e) => set("title", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Categoría</label>
                <input type="text" value={form.category} onChange={(e) => set("category", e.target.value)}
                  placeholder="Moda, Tendencias, etc."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Tags (separados por coma)</label>
                <input type="text" value={form.tags} onChange={(e) => set("tags", e.target.value)}
                  placeholder="moda, verano, colección"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">URL de Imagen</label>
                <input type="url" value={form.image} onChange={(e) => set("image", e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Extracto</label>
                <textarea rows={2} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)}
                  placeholder="Breve descripción que aparece en el listado..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Contenido *</label>
                <textarea rows={8} required value={form.content} onChange={(e) => set("content", e.target.value)}
                  placeholder="Escribe el contenido del artículo..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-y" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="publishNow" checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} className="w-4 h-4 accent-gray-900" />
              <label htmlFor="publishNow" className="text-sm text-gray-700 cursor-pointer">Publicar ahora</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setShowForm(false); setError(""); setForm(emptyForm); }}
                className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60">
                {saving ? "Guardando..." : form.isPublished ? "Publicar" : "Guardar borrador"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de posts */}
      {posts.length === 0 && !showForm ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No hay artículos publicados</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-gray-900 underline underline-offset-2">
            Escribe el primero
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
              {post.image && (
                <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.image} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{post.title}</p>
                    {post.excerpt && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{post.excerpt}</p>}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {post.category && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{post.category}</span>
                      )}
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full">#{tag}</span>
                      ))}
                      <span className="text-xs text-gray-300">
                        {new Date(post.createdAt).toLocaleDateString("es-HN")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleTogglePublish(post.id, post.isPublished)}
                      title={post.isPublished ? "Despublicar" : "Publicar"}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors ${
                        post.isPublished
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {post.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {post.isPublished ? "Publicado" : "Borrador"}
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
