import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { averpay } from "@/lib/providers";

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  try { return NextResponse.json(await averpay("withdraw/methods")); }
  catch (e: any) { return NextResponse.json({ error: e.message || "Gagal mengambil metode withdraw." }, { status: 502 }); }
}

export async function POST(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  try {
    const body = await req.json();
    const amount = Number(body.amount);
    const method = String(body.method || "").trim();
    const accountNumber = String(body.account_number || "").trim();
    const instant = body.instant === true;
    if (!Number.isSafeInteger(amount) || amount < 1) return NextResponse.json({ error: "Nominal withdraw tidak valid." }, { status: 400 });
    if (!method || !accountNumber) return NextResponse.json({ error: "Metode dan nomor rekening/e-wallet wajib diisi." }, { status: 400 });
    const result = await averpay("withdraw", { amount, method, account_number: accountNumber, instant: instant ? "true" : "false" });
    return NextResponse.json(result);
  } catch (e: any) { return NextResponse.json({ error: e.message || "Withdraw gagal." }, { status: 502 }); }
}
