import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { averpay } from "@/lib/providers";
export async function GET(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id wajib diisi." }, { status: 400 });
  try { return NextResponse.json(await averpay("withdraw/status", { id })); }
  catch (e: any) { return NextResponse.json({ error: e.message || "Gagal cek status withdraw." }, { status: 502 }); }
}
