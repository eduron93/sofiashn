export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { UsuariosClient } from "./UsuariosClient";

export const metadata: Metadata = { title: "Usuarios Admin" };

export default function UsuariosPage() {
  return <UsuariosClient />;
}
