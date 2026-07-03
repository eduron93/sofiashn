export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { ConfiguracionClient } from "./ConfiguracionClient";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Configuración" };

async function loadSettings(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.setting.findMany();
    const cfg: Record<string, string> = {};
    for (const row of rows) cfg[row.key] = row.value;
    return cfg;
  } catch {
    return {};
  }
}

export default async function AdminConfiguracionPage() {
  const settings = await loadSettings();
  return <ConfiguracionClient settings={settings} />;
}
