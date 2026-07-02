"use client";

import { useState, useMemo } from "react";
import { Star, Check, X, Trash2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  isApproved: boolean;
  createdAt: string;
  user: { name: string | null; email: string };
  product: { name: string; slug: string };
}

export function ResenasClient({ reviews: initial }: { reviews: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initial);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter((r) => {
      const matchSearch =
        !q ||
        r.product.name.toLowerCase().includes(q) ||
        (r.user.name ?? "").toLowerCase().includes(q) ||
        r.user.email.toLowerCase().includes(q) ||
        (r.title ?? "").toLowerCase().includes(q) ||
        (r.body ?? "").toLowerCase().includes(q);
      const matchFilter =
        filter === "all" ||
        (filter === "pending" && !r.isApproved) ||
        (filter === "approved" && r.isApproved);
      return matchSearch && matchFilter;
    });
  }, [reviews, search, filter]);

  const pending = reviews.filter((r) => !r.isApproved).length;

  const handleApprove = async (id: string, isApproved: boolean) => {
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isApproved }),
    });
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, isApproved } : r));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta reseña?")) return;
    await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reseñas</h1>
          <p className="text-gray-500 text-sm mt-1">
            {reviews.length} reseñas{pending > 0 && <span className="ml-2 text-amber-600 font-medium">· {pending} pendientes</span>}
          </p>
        </div>
      </div>

      {/* Filtros y buscador */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por producto, cliente o contenido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                filter === f ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {f === "all" ? "Todas" : f === "pending" ? "Pendientes" : "Aprobadas"}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Star className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No hay reseñas que coincidan</p>
          </div>
        ) : (
          filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Encabezado */}
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={cn("w-3.5 h-3.5", s <= r.rating ? "text-amber-400 fill-current" : "text-gray-200 fill-current")} />
                      ))}
                    </div>
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      r.isApproved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {r.isApproved ? "Aprobada" : "Pendiente"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("es-HN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>

                  {/* Producto y cliente */}
                  <p className="text-xs text-gray-400 mb-2">
                    <span className="font-medium text-gray-700">{r.product.name}</span>
                    {" · "}
                    {r.user.name ?? r.user.email}
                  </p>

                  {/* Contenido */}
                  {r.title && <p className="text-sm font-semibold text-gray-900 mb-1">{r.title}</p>}
                  {r.body && <p className="text-sm text-gray-600 leading-relaxed">{r.body}</p>}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {r.isApproved ? (
                    <button
                      onClick={() => handleApprove(r.id, false)}
                      title="Desaprobar"
                      className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprove(r.id, true)}
                      title="Aprobar"
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(r.id)}
                    title="Eliminar"
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
