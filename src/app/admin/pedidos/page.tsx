export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { PedidosClient } from "./PedidosClient";

export const metadata: Metadata = { title: "Pedidos" };

async function getOrders() {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        address: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch {
    return [];
  }
}

export default async function AdminPedidosPage() {
  const orders = await getOrders();
  return <PedidosClient orders={orders as any[]} />;
}
