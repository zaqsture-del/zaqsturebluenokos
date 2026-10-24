import { NextResponse } from "next/server";
import { otpProvider } from "@/lib/providers";
import { getAuthenticatedUser } from "@/lib/user-auth";
export async function GET(req: Request) {
  try {
    if (!await getAuthenticatedUser(req)) return NextResponse.json({ error:"Silakan login terlebih dahulu." }, { status:401 });
    const data = await otpProvider("balance");
    return NextResponse.json({ ...data, balance:Number(data.balance || 0), currency:"IDR" });
  } catch(e:any) { return NextResponse.json({ error:e.message || "Gagal mengecek saldo provider." }, { status:502 }); }
}
