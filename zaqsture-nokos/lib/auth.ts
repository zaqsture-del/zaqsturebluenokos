import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const cookieName = "zaqsture_admin";
function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET harus berisi minimal 32 karakter.");
  return new TextEncoder().encode(value);
}
export async function createSession(username: string) {
  const token = await new SignJWT({ username, role: "admin" }).setProtectedHeader({ alg: "HS256" })
    .setIssuedAt().setExpirationTime("8h").sign(secret());
  const jar = await cookies();
  jar.set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
}
export async function isAdmin() {
  try {
    const jar = await cookies();
    const token = jar.get(cookieName)?.value;
    if (!token) return false;
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "admin" && payload.username === process.env.ADMIN_USERNAME;
  } catch { return false; }
}
export async function clearSession() {
  const jar = await cookies();
  jar.set(cookieName, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}