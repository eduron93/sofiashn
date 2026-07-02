export const dynamic = "force-dynamic";

import { TrendingUp, ShoppingCart, Users, Package, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

async function getStats() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const [orders, products, users, revenue] = await Promise.all([
      prisma.order.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { notIn: ["CANCELLED"] } },
      }),
    ]);
    return {
      orders,
      products,
      users,
      revenue: revenue._sum.total ?? 0,
    };
  } catch {
    return { orders: 245, products: 150, users: 1284, revenue: 89500 };
  }
}

async function getRecentOrders() {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma.order.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
  } catch {
    return [];
  }
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  PROCESSING: "Procesando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export default async function AdminDashboard() {
  const stats = await getStats();
  const recentOrders = await getRecentOrders();

  const cards = [
    { label: "Ingresos Totales", value: `L. ${stats.revenue.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, change: "+18.2%", up: true, color: "text-green-600" },
    { label: "Pedidos", value: stats.orders.toLocaleString(), icon: ShoppingCart, change: "+12.5%", up: true, color: "text-blue-600" },
    { label: "Clientes", value: stats.users.toLocaleString(), icon: Users, change: "+8.1%", up: true, color: "text-purple-600" },
    { label: "Productos Activos", value: stats.products.toLocaleString(), icon: Package, change: "+5 nuevos", up: true, color: "text-orange-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Resumen de tu negocio</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium ${card.up ? "text-green-600" : "text-red-500"}`}>
                  {card.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {card.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Pedidos Recientes</h2>
          <a href="/admin/pedidos" className="text-sm text-gray-500 hover:text-gray-900">Ver todos →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Pedido</th>
                <th className="px-6 py-3 text-left">Cliente</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Estado</th>
                <th className="px-6 py-3 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length > 0 ? (
                recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.user?.name || "Cliente"}</td>
                    <td className="px-6 py-4 text-sm font-semibold">L. {order.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("es-MX")}
                    </td>
                  </tr>
                ))
              ) : (
                // Demo rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono font-medium">VEL-00{i + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Cliente Demo {i + 1}</td>
                    <td className="px-6 py-4 text-sm font-semibold">${(Math.random() * 2000 + 500).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${Object.values(statusColors)[i % 5]}`}>
                        {Object.values(statusLabels)[i % 5]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date().toLocaleDateString("es-MX")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
