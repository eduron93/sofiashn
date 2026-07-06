import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`;
  const key = process.env.SUPABASE_SERVICE_KEY ?? "";
  return createClient(url, key);
}

// Extrae el nombre del archivo dentro del bucket "uploads" desde una URL pública de Supabase
function extractFilename(url: string): string | null {
  try {
    const marker = "/object/public/uploads/";
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(url.slice(idx + marker.length));
  } catch {
    return null;
  }
}

// Elimina una o más URLs de Supabase Storage (ignora URLs que no sean de Supabase)
export async function deleteStorageImages(urls: (string | null | undefined)[]): Promise<void> {
  const filenames = urls
    .filter((u): u is string => typeof u === "string" && u.includes(".supabase.co"))
    .map(extractFilename)
    .filter((f): f is string => f !== null);

  if (filenames.length === 0) return;

  const supabase = getSupabase();
  const { error } = await supabase.storage.from("uploads").remove(filenames);
  if (error) console.error("Storage delete error:", error.message);
}
