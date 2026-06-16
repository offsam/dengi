import type { Metadata } from "next";
import { AppShell } from "@/app/components/app-shell";
import { switzer } from "@/lib/fonts/switzer";
import "./globals.css";

export const metadata: Metadata = {
  title: "dengi",
  description: "Личные финансы",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${switzer.variable} h-full antialiased`}>
      <body className={`${switzer.className} min-h-full flex flex-col font-sans`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
