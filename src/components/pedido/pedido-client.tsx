"use client";

import * as React from "react";
import { CheckCircle2, UtensilsCrossed, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProdutoCard } from "./produto-card";
import { Cart } from "./cart";
import { ExtrasModal } from "./extras-modal";
import { CheckoutModal } from "./checkout-modal";
import { useCarrinho, type CarrinhoItem } from "@/store/useCarrinho";
import { formatCurrency, formatNumeroPedido } from "@/lib/utils";
import { aceitaExtras } from "@/lib/produto";
import type { Produto } from "@/types";

interface PedidoClientProps {
  produtos: Produto[];
  nomeEvento: string;
}

export function PedidoClient({ produtos, nomeEvento }: PedidoClientProps) {
  const adicionar = useCarrinho((s) => s.adicionar);
  const definirExtras = useCarrinho((s) => s.definirExtras);
  const itens = useCarrinho((s) => s.itens);
  const total = useCarrinho((s) => s.total);
  const totalItens = useCarrinho((s) => s.totalItens);

  // Extras nunca aparecem no cardápio principal (só como adicional).
  const extras = produtos.filter((p) => p.categoria === "EXTRAS");
  // Lista única, sem divisão por categoria: combos primeiro, depois o restante.
  const prioridade: Record<string, number> = {
    COMBOS: 0,
    HAMBURGUERES: 1,
    BATATAS: 2,
    BEBIDAS: 3,
  };
  const cardapio = produtos
    .filter((p) => p.categoria !== "EXTRAS")
    .sort(
      (a, b) =>
        (prioridade[a.categoria] ?? 9) - (prioridade[b.categoria] ?? 9) ||
        a.ordem - b.ordem ||
        a.nome.localeCompare(b.nome)
    );

  const [extrasTarget, setExtrasTarget] = React.useState<{
    item: CarrinhoItem;
    modo: "add" | "edit";
  } | null>(null);
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [carrinhoOpen, setCarrinhoOpen] = React.useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = React.useState<number | null>(
    null
  );

  function handleAdd(produto: Produto) {
    const uid = adicionar(produto);
    // Hambúrguer ou combo com hambúrguer → abre o modal de extras logo após.
    if (aceitaExtras(produto) && extras.length > 0) {
      const item = useCarrinho.getState().itens.find((i) => i.uid === uid);
      if (item) setExtrasTarget({ item, modo: "add" });
    }
  }

  function handleEditarExtras(item: CarrinhoItem) {
    setExtrasTarget({ item, modo: "edit" });
  }

  function confirmarExtras(lista: Produto[]) {
    if (extrasTarget) definirExtras(extrasTarget.item.uid, lista);
  }

  function abrirCheckout() {
    setCarrinhoOpen(false);
    setCheckoutOpen(true);
  }

  if (pedidoConfirmado !== null) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 bg-gradient-to-b from-primary/5 to-transparent px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-2xl font-black text-slate-800">
          Pedido enviado! 🎉
        </h1>
        <p className="text-muted-foreground">
          Seu pedido{" "}
          <b className="text-slate-800">
            #{formatNumeroPedido(pedidoConfirmado)}
          </b>{" "}
          foi recebido e já está em preparo. 👨‍🍳
        </p>
        <Button
          onClick={() => setPedidoConfirmado(null)}
          size="lg"
          className="mt-2 font-bold"
        >
          Fazer novo pedido
        </Button>
      </div>
    );
  }

  const cartVazio = itens.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/40 to-background pb-24 lg:pb-0">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-20 border-b border-border bg-gradient-to-r from-primary to-emerald-600 text-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3.5 sm:px-6">
          <span className="text-3xl">🍔</span>
          <div>
            <h1 className="text-lg font-black leading-tight">{nomeEvento}</h1>
            <p className="text-xs text-white/80">Monte seu pedido 👇</p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_380px]">
        {/* Cardápio */}
        <div className="space-y-7">
          {produtos.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
              <UtensilsCrossed className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                O cardápio ainda não está disponível.
              </p>
            </div>
          )}

          {/* Lista única de produtos, sem divisão por categoria */}
          {cardapio.length > 0 && (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {cardapio.map((p) => (
                <ProdutoCard key={p.id} produto={p} onAdd={handleAdd} />
              ))}
            </div>
          )}
        </div>

        {/* Carrinho — painel fixo no desktop */}
        <aside className="hidden lg:sticky lg:top-[84px] lg:block lg:h-[calc(100vh-104px)]">
          <div className="h-full overflow-hidden rounded-2xl border border-border shadow-sm">
            <Cart onEditarExtras={handleEditarExtras} onCheckout={abrirCheckout} />
          </div>
        </aside>
      </div>

      {/* Barra inferior fixa (mobile) */}
      {!cartVazio && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden">
          <button
            onClick={() => setCarrinhoOpen(true)}
            className="flex w-full items-center justify-between rounded-xl bg-primary px-4 py-3 text-white shadow-sm active:scale-[0.99]"
          >
            <span className="flex items-center gap-2 font-bold">
              <span className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-primary">
                  {totalItens()}
                </span>
              </span>
              Ver pedido
            </span>
            <span className="text-lg font-black">{formatCurrency(total())}</span>
          </button>
        </div>
      )}

      {/* Drawer do carrinho (mobile) */}
      <Dialog open={carrinhoOpen} onOpenChange={setCarrinhoOpen}>
        <DialogContent className="flex h-[85vh] max-w-lg flex-col overflow-hidden p-0 lg:hidden [&>button]:hidden">
          <DialogTitle className="sr-only">Seu pedido</DialogTitle>
          <button
            onClick={() => setCarrinhoOpen(false)}
            className="absolute right-3 top-3.5 z-10 rounded-lg p-1.5 text-slate-500 hover:bg-secondary"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
          <Cart onEditarExtras={handleEditarExtras} onCheckout={abrirCheckout} />
        </DialogContent>
      </Dialog>

      <ExtrasModal
        open={extrasTarget !== null}
        onOpenChange={(o) => !o && setExtrasTarget(null)}
        nomeHamburguer={extrasTarget?.item.produto.nome ?? ""}
        extrasDisponiveis={extras}
        selecionados={extrasTarget?.item.extras ?? []}
        onConfirm={confirmarExtras}
        confirmLabel={extrasTarget?.modo === "edit" ? "Salvar extras" : "Adicionar"}
      />

      <CheckoutModal
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        onConfirmado={(numero) => setPedidoConfirmado(numero)}
      />
    </div>
  );
}
