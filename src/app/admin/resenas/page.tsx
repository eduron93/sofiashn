export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { ResenasClient } from "./ResenasClient";

export const metadata: Metadata = { title: "Reseñas" };

async function getReviews() {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma.review.findMany({
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function AdminResenasPage() {
  const reviews = await getReviews();
  return <ResenasClient reviews={reviews as any[]} />;
}
