"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  lowStockAlert: number;
  isActive: boolean;
  images: string[];
  category: { name: string };
  brand: { name: string } | null;
}

export function InventarioClient({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku ?? "").toLowerCase().includes(q) ||
        p.category.name.toLowerCase().includes(q) ||
        (p.brand?.name ?? "").toLowerCase().includes(q)
    );
  }, [products, search]);

  return (
    <>
      {/* Buscador */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, SKU o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        {search && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Producto</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">SKU</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Categoría</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Stock</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Alerta</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-sm text-gray-400">
                  No se encontraron productos con ese criterio
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const isOut = p.stock === 0;
                const isLow = !isOut && p.stock <= p.lowStockAlert;
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-gray-50 transition-colors ${isOut ? "bg-red-50/30" : isLow ? "bg-amber-50/30" : ""}`}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {p.images[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900 line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-mono text-gray-500">{p.sku || "—"}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{p.category.name}</td>
                    <td className="px-6 py-3">
                      <span className={`text-sm font-semibold ${isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-gray-900"}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-400">{p.lowStockAlert}</td>
                    <td className="px-6 py-3">
                      {isOut ? (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700">Sin stock</span>
                      ) : isLow ? (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Stock bajo</span>
                      ) : (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">OK</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
