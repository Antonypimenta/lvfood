"use client";

import * as React from "react";
import { CheckCircle2, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { ProdutoCard } from "./produto-card";
import { Cart } from "./cart";
import { ExtrasModal } from "./extras-modal";
import { CheckoutModal } from "./checkout-modal";
import { useCarrinho, type CarrinhoItem } from "@/store/useCarrinho";
import { CATEGORIAS_CARDAPIO, CATEGORIA_PRODUTO_LABEL } from "@/lib/constants";
import { formatNumeroPedido } from "@/lib/utils";
import type { Produto } from "@/types";

interface PedidoClientProps {
  produtos: Produto[];
  nomeEvento: string;
}

export function PedidoClient({ produtos, nomeEvento }: PedidoClientProps) {
  const adicionar = useCarrinho((s) => s.adicionar);
  const definirExtras = useCarrinho((s) => s.definirExtras);

  // Agrupa o cardápio. Extras nunca aparecem no cardápio principal.
  const combos = produtos.filter((p) => p.categoria === "COMBOS");
  const extras = produtos.filter((p) => p.categoria === "EXTRAS");
  const porCategoria = CATEGORIAS_CARDAPIO.map((cat) => ({
    categoria: cat,
    itens: produtos.filter((p) => p.categoria === cat),
  })).filter((g) => g.itens.length > 0);

  // Modal de extras (adicionar novo hambúrguer ou editar um existente).
  const [extrasTarget, setExtrasTarget] = React.useState<{
    item: CarrinhoItem;
    modo: "add" | "edit";
  } | null>(null);
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = React.useState<number | null>(
    null
  );

  function handleAdd(produto: Produto) {
    const uid = adicionar(produto);
    // Hambúrguer → abre o modal de extras logo após adicionar.
    if (produto.categoria === "HAMBURGUERES" && extras.length > 0) {
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

  if (pedidoConfirmado !== null) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <CheckCircle2 className="h-16 w-16 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">
          Pedido enviado! 🎉
        </h1>
        <p className="text-muted-foreground">
          Seu pedido{" "}
          <b className="text-foreground">
            #{formatNumeroPedido(pedidoConfirmado)}
          </b>{" "}
          foi recebido e já está em preparo.
        </p>
        <Button onClick={() => setPedidoConfirmado(null)} className="mt-2">
          Fazer novo pedido
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Logo compact />
          <div>
            <h1 className="text-lg font-bold text-foreground">{nomeEvento}</h1>
            <p className="text-xs text-muted-foreground">Faça seu pedido</p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px]">
        {/* Cardápio */}
        <div className="space-y-8">
          {produtos.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
              <UtensilsCrossed className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                O cardápio ainda não está disponível.
              </p>
            </div>
          )}

          {/* Combos em destaque no topo */}
          {combos.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold text-foreground">
                {CATEGORIA_PRODUTO_LABEL.COMBOS}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {combos.map((p) => (
                  <ProdutoCard key={p.id} produto={p} destaque onAdd={handleAdd} />
                ))}
              </div>
            </section>
          )}

          {/* Demais categorias (Hambúrgueres, Batatas, Bebidas) */}
          {porCategoria.map((grupo) => (
            <section key={grupo.categoria}>
              <h2 className="mb-3 text-lg font-bold text-foreground">
                {CATEGORIA_PRODUTO_LABEL[grupo.categoria]}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {grupo.itens.map((p) => (
                  <ProdutoCard key={p.id} produto={p} onAdd={handleAdd} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Carrinho */}
        <aside className="lg:sticky lg:top-[76px] lg:h-[calc(100vh-92px)]">
          <div className="h-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <Cart
              onEditarExtras={handleEditarExtras}
              onCheckout={() => setCheckoutOpen(true)}
            />
          </div>
        </aside>
      </div>

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
