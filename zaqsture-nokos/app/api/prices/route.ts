import { NextResponse } from "next/server";
import { otpProvider } from "@/lib/providers";
export async function GET(req: Request) {
  try {
    const q = new URL(req.url).searchParams;
    const service = q.get("service");
    if (!service) return NextResponse.json({ error:"service wajib diisi." }, { status:400 });
    const data = await otpProvider("prices", { service, country:q.get("country") || "id", server:q.get("server") || "ekonomi" });
    const providers = Array.isArray(data.providers) ? data.providers : [];
    return NextResponse.json({ ...data, providers:providers.map((p:any)=>({ id:String(p.id), price_idr:Number(p.price_idr||0)+600, stock:Number(p.stock||0), server:String(p.server||q.get("server")||"ekonomi") })).filter((p:any)=>p.stock > 0).sort((a:any,b:any)=>a.price_idr-b.price_idr) });
  } catch(e:any) { return NextResponse.json({ error:e.message || "Gagal mengambil harga." }, { status:502 }); }
}
