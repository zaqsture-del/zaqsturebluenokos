import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Zaqsture — Platform Layanan NOKOS Terbaik",
  description: "Platform layanan nomor virtual dan verifikasi SMS.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}