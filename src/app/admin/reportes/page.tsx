export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { TrendingUp, ShoppingBag, Users, Package, DollarSign, Star } from "lucide-react";

export const metadata: Metadata = { title: "Reportes" };

async function getStats() {
  try {
    const { prisma } = await import("@/lib/prisma");

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalOrders,
      monthOrders,
      lastMonthOrders,
      totalRevenue,
      monthRevenue,
      lastMonthRevenue,
      totalCustomers,
      monthCustomers,
      totalProducts,
      activeProducts,
      topProducts,
      ordersByStatus,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: startOfMonth } } }),
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.findMany({
        select: { name: true, salesCount: true, price: true, images: true },
        orderBy: { salesCount: "desc" },
        take: 5,
      }),
      prisma.order.groupBy({ by: ["status"], _count: { status: true } }),
      prisma.order.findMany({
        select: {
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true,
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

    return {
      totalOrders,
      monthOrders,
      lastMonthOrders,
      totalRevenue: totalRevenue._sum.total ?? 0,
      monthRevenue: monthRevenue._sum.total ?? 0,
      lastMonthRevenue: lastMonthRevenue._sum.total ?? 0,
      totalCustomers,
      monthCustomers,
      totalProducts,
      activeProducts,
      topProducts,
      ordersByStatus,
      recentOrders,
    };
  } catch {
    return null;
  }
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente", CONFIRMED: "Confirmado", PROCESSING: "En proceso",
  SHIPPED: "Enviado", DELIVERED: "Entregado", CANCELLED: "Cancelado",
};
const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700", CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700", SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700", CANCELLED: "bg-red-100 text-red-700",
};

export default async function AdminReportesPage() {
  const stats = await getStats();

  if (!stats) {
    return (
      <div className="text-center py-20 text-gray-400">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>No se pudieron cargar los reportes</p>
      </div>
    );
  }

  const revenueChange = pctChange(stats.monthRevenue, stats.lastMonthRevenue);
  const ordersChange = pctChange(stats.monthOrders, stats.lastMonthOrders);

  const cards = [
    {
      label: "Ingresos este mes",
      value: `L ${stats.monthRevenue.toLocaleString("es-HN", { minimumFractionDigits: 2 })}`,
      sub: `${revenueChange >= 0 ? "+" : ""}${revenueChange}% vs mes anterior`,
      up: revenueChange >= 0,
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Pedidos este mes",
      value: stats.monthOrders,
      sub: `${ordersChange >= 0 ? "+" : ""}${ordersChange}% vs mes anterior`,
      up: ordersChange >= 0,
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Clientes nuevos",
      value: stats.monthCustomers,
      sub: `${stats.totalCustomers} clientes en total`,
      up: true,
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Productos activos",
      value: stats.activeProducts,
      sub: `${stats.totalProducts} productos en total`,
      up: true,
      icon: Package,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-500 text-sm mt-1">
          Resumen de {new Date().toLocaleDateString("es-HN", { month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
            <p className={`text-xs mt-1 font-medium ${card.up ? "text-green-600" : "text-red-500"}`}>
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top productos */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-gray-900">Top 5 Productos</h2>
          </div>
          <div className="space-y-3">
            {stats.topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {p.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">L {p.price.toFixed(2)}</p>
                </div>
                <span className="text-xs font-semibold text-gray-600">{p.salesCount} ventas</span>
              </div>
            ))}
            {stats.topProducts.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Sin datos de ventas aún</p>
            )}
          </div>
        </div>

        {/* Pedidos por estado */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="w-4 h-4 text-blue-500" />
            <h2 className="font-semibold text-gray-900">Pedidos por Estado</h2>
          </div>
          <div className="space-y-2">
            {stats.ordersByStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[s.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {statusLabels[s.status] ?? s.status}
                </span>
                <span className="text-sm font-semibold text-gray-700">{s._count.status}</span>
              </div>
            ))}
            {stats.ordersByStatus.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Sin pedidos aún</p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-50">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total pedidos</span>
              <span className="font-semibold text-gray-900">{stats.totalOrders}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Ingresos totales</span>
              <span className="font-semibold text-gray-900">L {stats.totalRevenue.toLocaleString("es-HN", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Pedidos recientes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4">Pedidos Recientes</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase pb-2">Pedido</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase pb-2">Cliente</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase pb-2">Total</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase pb-2">Estado</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase pb-2">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentOrders.map((o) => (
                <tr key={o.orderNumber} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 text-xs font-mono text-gray-500">{o.orderNumber}</td>
                  <td className="py-3 text-sm text-gray-700">{o.user?.name ?? "Invitado"}</td>
                  <td className="py-3 text-sm font-semibold text-gray-900">L {o.total.toFixed(2)}</td>
                  <td className="py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {statusLabels[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-gray-400">
                    {new Date(o.createdAt).toLocaleDateString("es-HN")}
                  </td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-400 text-sm py-8">Sin pedidos registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
