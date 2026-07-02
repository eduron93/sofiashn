import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const path = join(process.cwd(), "store-config.json");
    const raw = existsSync(path) ? JSON.parse(readFileSync(path, "utf-8")) : {};
    return NextResponse.json({
      // Tienda
      store_name: raw.store_name ?? "VELORA",
      store_logo: raw.store_logo ?? "",
      store_email: raw.store_email ?? "",
      store_phone: raw.store_phone ?? "",
      store_address: raw.store_address ?? "",
      store_description: raw.store_description ?? "",
      // Envíos
      shipping_free_threshold: raw.shipping_free_threshold ?? "999",
      shipping_standard_price: raw.shipping_standard_price ?? "99",
      shipping_express_price: raw.shipping_express_price ?? "150",
      shipping_estimated_days: raw.shipping_estimated_days ?? "3-5 días hábiles",
      shipping_express_days: raw.shipping_express_days ?? "1-2 días hábiles",
      shipping_free_enabled: raw.shipping_free_enabled ?? "true",
      shipping_express_enabled: raw.shipping_express_enabled ?? "true",
      // Pagos
      payment_cod_enabled: raw.payment_cod_enabled ?? "true",
      payment_transfer_enabled: raw.payment_transfer_enabled ?? "true",
      payment_card_enabled: raw.payment_card_enabled ?? "false",
      payment_bank_name: raw.payment_bank_name ?? "",
      payment_bank_account: raw.payment_bank_account ?? "",
      payment_bank_holder: raw.payment_bank_holder ?? "",
      // Redes sociales
      social_instagram: raw.social_instagram ?? "",
      social_facebook: raw.social_facebook ?? "",
      social_tiktok: raw.social_tiktok ?? "",
      social_whatsapp: raw.social_whatsapp ?? "",
      // Seguridad
      maintenance_mode: raw.maintenance_mode ?? "false",
      registration_enabled: raw.registration_enabled ?? "true",
    });
  } catch {
    return NextResponse.json({
      store_name: "VELORA",
      shipping_free_threshold: "999",
      shipping_standard_price: "99",
      shipping_express_price: "150",
      shipping_free_enabled: "true",
      shipping_express_enabled: "true",
      payment_cod_enabled: "true",
      payment_transfer_enabled: "true",
      payment_card_enabled: "false",
      maintenance_mode: "false",
      registration_enabled: "true",
    });
  }
}
