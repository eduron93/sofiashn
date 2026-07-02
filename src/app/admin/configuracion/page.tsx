export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { ConfiguracionClient } from "./ConfiguracionClient";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export const metadata: Metadata = { title: "Configuración" };

function loadSettings(): Record<string, string> {
  try {
    const path = join(process.cwd(), "store-config.json");
    if (!existsSync(path)) return {};
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return {};
  }
}

export default function AdminConfiguracionPage() {
  const settings = loadSettings();
  return <ConfiguracionClient settings={settings} />;
}
