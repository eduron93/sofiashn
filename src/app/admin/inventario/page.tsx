export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { InventarioClient } from "./InventarioClient";

export const metadata: Metadata = { title: "Inventario" };

async function getInventory() {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        lowStockAlert: true,
        isActive: true,
        images: true,
        category: { select: { name: true } },
        brand: { select: { name: true } },
      },
      orderBy: { stock: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function AdminInventarioPage() {
  const products = await getInventory();

  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockAlert).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
        <p className="text-gray-500 text-sm mt-1">{products.length} productos</p>
      </div>

      {/* Alertas resumen */}
      {(outOfStock > 0 || lowStock > 0) && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {outOfStock > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700">{outOfStock} sin stock</p>
                <p className="text-xs text-red-500">Requieren reposición urgente</p>
              </div>
            </div>
          )}
          {lowStock > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-700">{lowStock} stock bajo</p>
                <p className="text-xs text-amber-500">Por debajo del mínimo</p>
              </div>
            </div>
          )}
        </div>
      )}

      <InventarioClient products={products as any[]} />
    </div>
  );
}
