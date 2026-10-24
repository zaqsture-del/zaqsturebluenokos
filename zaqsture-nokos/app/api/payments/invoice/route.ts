import { NextResponse } from "next/server";
import { averpay } from "@/lib/providers";
import { getAuthenticatedUser } from "@/lib/user-auth";
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    const { amount } = await req.json();
    const n = Number(amount);
    if (!Number.isSafeInteger(n) || n < 10000 || n > 1000000) return NextResponse.json({ error: "Nominal harus Rp10.000–Rp1.000.000." }, { status: 400 });
    const invoice = await averpay("invoice", { amount: n });
    return NextResponse.json({ ...invoice, customer_id: user.id });
  } catch (e: any) { return NextResponse.json({ error: e.message || "Gagal membuat invoice." }, { status: 502 }); }
}
