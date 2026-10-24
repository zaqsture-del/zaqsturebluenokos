import { NextResponse } from "next/server";
import { otpProvider } from "@/lib/providers";
const icons: Record<string,string> = { wa:"🟢", tg:"✈️", go:"🔎", fb:"🔵", ig:"📸", tt:"🎵", x:"𝕏", sh:"🛍️", ub:"🚗" };
const fallback = [
  {id:"wa",name:"WhatsApp",price:0,icon:"🟢"},{id:"tg",name:"Telegram",price:0,icon:"✈️"},
  {id:"go",name:"Google/Gmail/YouTube",price:0,icon:"🔎"},{id:"fb",name:"Facebook",price:0,icon:"🔵"},
  {id:"ig",name:"Instagram",price:0,icon:"📸"},{id:"tt",name:"TikTok",price:0,icon:"🎵"}
];
export async function GET(req: Request) {
  try {
    const server = new URL(req.url).searchParams.get("server") || "ekonomi";
    const data = await otpProvider("services", { server });
    const rows = Array.isArray(data.services) ? data.services : [];
    if (!rows.length) return NextResponse.json({ services: fallback, source: "fallback" });
    return NextResponse.json({ services: rows.map((s:any) => ({ id:String(s.code), name:String(s.name || s.code), price:0, icon:icons[String(s.code)] || "📱", server })), source:"zaqsture-provider" });
  } catch (e:any) {
    // Keep the UI navigable during setup; actual order endpoints still require a valid key.
    return NextResponse.json({ services: fallback, source:"fallback", warning:e.message });
  }
}
