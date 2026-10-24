import { NextResponse } from "next/server";
import { otpProvider } from "@/lib/providers";
export async function GET(req:Request) {
  try {
    const server = new URL(req.url).searchParams.get("server") || "ekonomi";
    const data = await otpProvider("countries.php", {server});
    return NextResponse.json({countries:Array.isArray(data.countries)?data.countries:[]});
  } catch(e:any) { return NextResponse.json({error:e.message || "Gagal mengambil negara."},{status:502}); }
}
