const otpBase = (process.env.ZAQSTURE_OTP_BASE_URL || "https://dibanana.id/api/v1").replace(/\/$/, "");
const payBase = (process.env.AVERPay_BASE_URL || "https://averpay.web.id/api").replace(/\/$/, "");

/** Server-side client for Zaqsture's OTP provider. Keep the API key in server env only. */
export async function otpProvider(path: string, params: Record<string, unknown> = {}, method: "GET" | "POST" = "GET") {
  const apiKey = process.env.ZAQSTURE_OTP_API_KEY;
  if (!apiKey) throw new Error("API key provider OTP belum diatur. Isi ZAQSTURE_OTP_API_KEY di Vercel.");
  const url = new URL(`${otpBase}/${path.replace(/^\//, "")}`);
  const headers: Record<string, string> = { Authorization: `Bearer ${apiKey}`, Accept: "application/json" };
  const init: RequestInit = { method, headers, cache: "no-store" };
  if (method === "GET") {
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) url.searchParams.set(k, String(v)); });
  } else {
    headers["Content-Type"] = "application/json";
    (init as any).body = JSON.stringify(params);
  }
  const res = await fetch(url, init);
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false) throw new Error(data?.message || data?.error || `Provider OTP error (${res.status})`);
  return data;
}
export async function averpay(path: string, params: Record<string, string | number> = {}) {
  if (!process.env.AVERPay_API_KEY) throw new Error("AverPay API key belum diatur.");
  const url = new URL(`${payBase}/${path.replace(/^\//, "")}`);
  url.searchParams.set("apikey", process.env.AVERPay_API_KEY);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `AverPay error (${res.status})`);
  return data;
}