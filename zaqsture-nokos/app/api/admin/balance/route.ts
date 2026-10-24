import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { averpay } from "@/lib/providers";
export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  try { return NextResponse.json(await averpay("balance")); }
  catch (e: any) { return NextResponse.json({ error: e.message || "Gagal cek saldo AverPay." }, { status: 502 }); }
}
