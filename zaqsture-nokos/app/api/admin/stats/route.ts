import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const excluded = new Set(["cancelled", "canceled", "expired", "refunded", "failed", "resend_cancelled"]);
const realizedProfit = (order: any) => excluded.has(String(order.status || "").toLowerCase()) ? 0 : Number(order.profit ?? 600);

export async function GET() {
  try {
    if (!await isAdmin()) return NextResponse.json({ error: "Sesi admin tidak ada. Silakan login ulang." }, { status: 401 });
    const client = db();
    const [o, u] = await Promise.all([
      client.from("orders").select("*").order("created_at", { ascending: false }),
      client.from("users").select("*").order("created_at", { ascending: false }).limit(50)
    ]);
    if (o.error) throw o.error;
    if (u.error) throw u.error;
    const allOrders = o.data || [];
    const users = u.data || [];
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    const totalProfit = allOrders.reduce((sum: number, order: any) => sum + realizedProfit(order), 0);
    const todayProfit = allOrders.reduce((sum: number, order: any) => {
      const created = order.created_at ? new Date(order.created_at) : null;
      const key = created ? `${created.getFullYear()}-${String(created.getMonth()+1).padStart(2,"0")}-${String(created.getDate()).padStart(2,"0")}` : "";
      return sum + (key === todayKey ? realizedProfit(order) : 0);
    }, 0);
    const orders = allOrders.slice(0, 100).map((order: any) => ({ ...order, realized_profit: realizedProfit(order) }));
    return NextResponse.json({
      totalOrders: allOrders.length,
      activeOrders: allOrders.filter((x: any) => ["pending", "active"].includes(String(x.status).toLowerCase())).length,
      totalRevenue: allOrders.filter((x: any) => !excluded.has(String(x.status || "").toLowerCase())).reduce((sum: number, x: any) => sum + Number(x.price || 0), 0),
      totalProfit, todayProfit, totalUsers: users.length, orders, users
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Dashboard gagal dimuat." }, { status: 500 });
  }
}
