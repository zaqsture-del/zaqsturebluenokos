import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET)
      return NextResponse.json({ error: "Login admin belum dikonfigurasi." }, { status: 503 });
    if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD)
      return NextResponse.json({ error: "Akun belum dibuat" }, { status: 401 });
    await createSession(username);
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Permintaan login tidak valid." }, { status: 400 }); }
}