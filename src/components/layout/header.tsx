"use client";

import { usePathname, useRouter } from "next/navigation";
import { Menu, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/store/useUiStore";
import { NAV_ITEMS } from "@/lib/navigation";

function tituloPagina(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  const item = NAV_ITEMS.find(
    (i) => i.href !== "/" && pathname.startsWith(i.href)
  );
  return item?.label ?? "LVFood";
}

export function Header({
  onOpenMobileMenu,
}: {
  onOpenMobileMenu: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const abrirNovoPedido = useUiStore((s) => s.abrirNovoPedido);
  const dispararFoco = useUiStore((s) => s.dispararFoco);

  function irParaBusca() {
    if (pathname !== "/pedidos") router.push("/pedidos");
    // Aguarda a navegação para focar o campo de busca.
    setTimeout(() => dispararFoco(), 60);
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <button
        onClick={onOpenMobileMenu}
        className="rounded-lg p-2 text-muted-foreground hover:bg-secondary lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="text-lg font-semibold text-foreground">
        {tituloPagina(pathname)}
      </h1>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          onClick={irParaBusca}
          className="hidden items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary sm:flex"
        >
          <Search className="h-4 w-4" />
          <span>Buscar pedidos</span>
          <kbd className="ml-4 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            Ctrl K
          </kbd>
        </button>

        <button
          onClick={irParaBusca}
          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary sm:hidden"
          aria-label="Buscar"
        >
          <Search className="h-5 w-5" />
        </button>

        <Button onClick={abrirNovoPedido} className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Pedido</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>
    </header>
  );
}
