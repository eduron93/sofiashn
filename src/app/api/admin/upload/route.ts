import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { extname } from "path";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminRequest } from "@/lib/admin-auth";

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

function getSupabase() {
  const url = `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`;
  const key = process.env.SUPABASE_SERVICE_KEY ?? "";
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });
    if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "El archivo supera 5 MB" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = extname(file.name) || ".jpg";
    const filename = `${randomBytes(12).toString("hex")}${ext}`;

    const supabase = getSupabase();
    const { error } = await supabase.storage
      .from("uploads")
      .upload(filename, buffer, { contentType: file.type, upsert: false });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from("uploads").getPublicUrl(filename);

    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
  }
}
