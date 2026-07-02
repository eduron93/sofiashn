export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { BannersClient } from "./BannersClient";

export const metadata: Metadata = { title: "Banners" };

async function getBanners() {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma.banner.findMany({ orderBy: { order: "asc" } });
  } catch {
    return [];
  }
}

export default async function AdminBannersPage() {
  const banners = await getBanners();
  return <BannersClient banners={banners as any[]} />;
}
