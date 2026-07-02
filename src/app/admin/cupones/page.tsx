export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { CuponesClient } from "./CuponesClient";

export const metadata: Metadata = { title: "Cupones" };

async function getCoupons() {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export default async function AdminCuponesPage() {
  const coupons = await getCoupons();
  return <CuponesClient coupons={coupons as any[]} />;
}
