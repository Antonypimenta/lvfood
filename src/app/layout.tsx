import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "LVFood — Gestão de Delivery",
  description: "Sistema de gerenciamento de pedidos de delivery — LVFood",
};

export const viewport: Viewport = {
  themeColor: "#16A34A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans">
        <AppShell>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  );
}
