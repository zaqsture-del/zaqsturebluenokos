import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { otpProvider } from "@/lib/providers";
import { getAuthenticatedUser } from "@/lib/user-auth";

export async function GET(req: Request) {
  try {
    const database = db();
    if (await isAdmin()) {
      const { data, error } = await database.from("orders").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return NextResponse.json({ orders: (data || []).map((o:any)=>({...o, otp:o.provider_response?.otp_code || o.provider_response?.otp_code_2 || null})) });
    }
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Silakan login untuk melihat riwayat.", orders: [] }, { status: 401 });
    const { data, error } = await database.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    return NextResponse.json({ orders: (data || []).map((o:any)=>({...o, otp:o.provider_response?.otp_code || o.provider_response?.otp_code_2 || null})) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Gagal memuat pesanan.", orders: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    const body = await req.json();
    if (!body.product_id) return NextResponse.json({ error: "Pilih produk harga terlebih dahulu." }, { status: 400 });
    const result = await otpProvider("order", { id: String(body.product_id), ...(body.operator ? { operator: String(body.operator) } : {}) }, "POST");
    const order = {
      user_id: user.id,
      provider_order_id: String(result.order_id ?? ""),
      service: String(result.service ?? body.service ?? "OTP"),
      phone_number: String(result.phone_number ?? ""),
      status: String(result.status ?? "pending"),
      provider_cost: Number(result.price_idr ?? 0),
      price: Number(result.price_idr ?? 0) + 600,
      profit: 600,
      provider_response: result
    };
    const { data, error } = await db().from("orders").insert(order).select().single();
    if (error) throw error;
    return NextResponse.json({ order: { id: data.id, provider_order_id: data.provider_order_id, number: data.phone_number, phone_number: data.phone_number, status: data.status, service: data.service, price: data.price, profit: data.profit, otp: result.otp_code || null } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Order gagal dibuat." }, { status: 502 });
  }
}
