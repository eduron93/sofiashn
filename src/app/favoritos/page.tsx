"use client";

import { useEffect, useState } from "react";
import { useFavoritesStore } from "@/store/favorites";
import { ProductCard } from "@/components/product/ProductCard";
import { Heart } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types";

export default function FavoritesPage() {
  const { ids, syncWithServer } = useFavoritesStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Sincroniza con el servidor al cargar (si hay sesión trae los favoritos de la BD)
  useEffect(() => {
    syncWithServer().finally(() => {});
  }, []);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/products/favorites?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <div className="min-h-screen bg-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="w-7 h-7 text-rose-500" /> Mis Favoritos
          </h1>
          <p className="text-gray-500 mt-1">{ids.length} productos guardados</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="aspect-[3/4] bg-gray-100 animate-pulse rounded-2xl" />
              </div>
            ))}
          </div>
        ) : ids.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-400">No tienes favoritos guardados</p>
            <p className="text-gray-400 text-sm mt-2">Explora nuestro catálogo y guarda los productos que te gusten</p>
            <Link
              href="/catalogo"
              className="inline-block mt-6 px-8 py-3 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
