export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { ClientesClient } from "./ClientesClient";

export const metadata: Metadata = { title: "Clientes" };

async function getClients() {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true,
        isActive: true, createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function AdminClientesPage() {
  const clients = await getClients();
  return <ClientesClient clients={clients as any[]} />;
}
