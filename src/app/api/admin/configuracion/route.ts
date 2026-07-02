import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { verifyAdminRequest } from "@/lib/admin-auth";

const CONFIG_PATH = join(process.cwd(), "store-config.json");

const ALLOWED_KEYS = new Set([
  "store_name", "store_email", "store_phone", "store_address",
  "store_logo", "store_currency", "store_description",
  "shipping_free_threshold", "shipping_standard_price",
  "shipping_express_price", "shipping_estimated_days",
  "shipping_express_days", "shipping_free_enabled",
  "shipping_express_enabled", "shipping_pickup_enabled",
  "payment_cod_enabled", "payment_transfer_enabled",
  "payment_card_enabled", "payment_bank_name",
  "payment_bank_account", "payment_bank_holder",
  "social_instagram", "social_facebook", "social_tiktok", "social_whatsapp",
  "maintenance_mode", "registration_enabled",
  "reviews_enabled", "guest_checkout", "admin_email",
  "announcement_enabled", "announcement_text",
  "seo_title", "seo_description", "seo_keywords", "seo_og_image",
  "email_smtp_user", "email_smtp_pass",
]);

function readConfig(): Record<string, string> {
  try {
    if (!existsSync(CONFIG_PATH)) return {};
    return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    return {};
  }
}

export async function GET(req: NextRequest) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;
  return NextResponse.json(readConfig());
}

export async function POST(req: NextRequest) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    if (typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    // Solo permitir claves conocidas y valores string
    const filtered: Record<string, string> = {};
    for (const [key, value] of Object.entries(body)) {
      if (ALLOWED_KEYS.has(key) && typeof value === "string" && value.length <= 500) {
        filtered[key] = value;
      }
    }

    const current = readConfig();
    const updated = { ...current, ...filtered };
    writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al guardar configuración" }, { status: 500 });
  }
}
