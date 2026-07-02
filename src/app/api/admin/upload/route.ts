import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "fs";
import { join, extname } from "path";
import { randomBytes } from "crypto";
import { verifyAdminRequest } from "@/lib/admin-auth";

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

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
    const uploadsDir = join(process.cwd(), "public", "uploads");

    mkdirSync(uploadsDir, { recursive: true });
    writeFileSync(join(uploadsDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
  }
}
