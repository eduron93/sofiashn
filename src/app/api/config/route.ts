import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEFAULTS: Record<string, string> = {
  store_name: "SOFIAS HN",
  store_logo: "",
  store_email: "",
  store_phone: "",
  store_address: "",
  store_description: "",
  shipping_free_threshold: "999",
  shipping_standard_price: "99",
  shipping_express_price: "150",
  shipping_estimated_days: "3-5 días hábiles",
  shipping_express_days: "1-2 días hábiles",
  shipping_free_enabled: "true",
  shipping_express_enabled: "true",
  payment_cod_enabled: "true",
  payment_transfer_enabled: "true",
  payment_card_enabled: "false",
  payment_bank_name: "",
  payment_bank_account: "",
  payment_bank_holder: "",
  social_instagram: "",
  social_facebook: "",
  social_tiktok: "",
  social_whatsapp: "",
  maintenance_mode: "false",
  registration_enabled: "true",
};

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.setting.findMany();
    const raw: Record<string, string> = {};
    for (const row of rows) raw[row.key] = row.value;
    const result: Record<string, string> = {};
    for (const key of Object.keys(DEFAULTS)) {
      result[key] = raw[key] ?? DEFAULTS[key];
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(DEFAULTS);
  }
}
