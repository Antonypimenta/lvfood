"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileSidebar } from "./mobile-sidebar";
import { PedidoModal } from "@/components/pedidos/pedido-modal";
import { usePolling } from "@/hooks/usePolling";
import { useAtalhos } from "@/hooks/useAtalhos";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  usePolling();
  useAtalhos();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar fixa (desktop) */}
      <Sidebar />

      {/* Sidebar mobile (drawer) */}
      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />

      {/* Conteúdo */}
      <div className="lg:pl-64">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      {/* Modal global de pedido */}
      <PedidoModal />
    </div>
  );
}
