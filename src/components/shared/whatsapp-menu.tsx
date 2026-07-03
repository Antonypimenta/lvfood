"use client";

import * as React from "react";
import { MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useStore } from "@/store/useStore";
import {
  cn,
  formatCurrency,
  formatNumeroPedido,
  whatsappUrl,
} from "@/lib/utils";
import type { Pedido } from "@/types";

interface WhatsAppMenuProps {
  pedido: Pedido;
  variant?: "icon" | "kanban";
}

/** Sugestões de mensagem prontas, personalizadas com os dados do pedido. */
function sugestoes(pedido: Pedido, evento: string) {
  const num = formatNumeroPedido(pedido.numero);
  const nome = pedido.nome.split(" ")[0];
  const endereco = [pedido.endereco, pedido.complemento, pedido.bairro]
    .filter(Boolean)
    .join(", ");
  return [
    {
      titulo: "Confirmar pedido",
      texto: `Olá ${nome}! 👋 Aqui é do ${evento}. Recebemos seu pedido #${num} e já está em preparo. 🍔`,
    },
    {
      titulo: "Pedido pronto",
      texto: `Olá ${nome}! ✅ Seu pedido #${num} está *pronto*!`,
    },
    {
      titulo: "Saiu para entrega",
      texto: `Olá ${nome}! 🛵 Seu pedido #${num} *saiu para entrega* e chega em instantes.`,
    },
    {
      titulo: "Confirmar endereço",
      texto: `Olá ${nome}! 📍 Confirmando a entrega do pedido #${num}: ${endereco}. Está correto?`,
    },
    {
      titulo: "Cobrar / pagamento",
      texto: `Olá ${nome}! Seu pedido #${num} ficou em ${formatCurrency(
        pedido.valor
      )}. Como prefere pagar? PIX, dinheiro ou cartão? 💳`,
    },
  ];
}

export function WhatsAppMenu({ pedido, variant = "icon" }: WhatsAppMenuProps) {
  const [open, setOpen] = React.useState(false);
  const config = useStore((s) => s.config);
  const evento = config?.nomeEvento ?? "LVFood";
  const opcoes = sugestoes(pedido, evento);

  function stop(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <>
      {variant === "kanban" ? (
        <button
          onClick={(e) => {
            stop(e);
            setOpen(true);
          }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-50 px-2 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </button>
      ) : (
        <button
          onClick={(e) => {
            stop(e);
            setOpen(true);
          }}
          className="rounded-md p-1.5 text-green-600 transition-colors hover:bg-green-50"
          title="WhatsApp"
          aria-label="Enviar WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md" onClick={stop}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Enviar no WhatsApp
            </DialogTitle>
            <DialogDescription>
              {pedido.nome} · #{formatNumeroPedido(pedido.numero)} — escolha uma
              mensagem sugerida ou abra a conversa em branco.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            {opcoes.map((op) => (
              <a
                key={op.titulo}
                href={whatsappUrl(pedido.telefone, op.texto)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="group rounded-xl border border-border bg-card p-3 transition-colors hover:border-green-300 hover:bg-green-50"
              >
                <p className="text-sm font-semibold text-green-700">
                  {op.titulo}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {op.texto}
                </p>
              </a>
            ))}

            <a
              href={whatsappUrl(pedido.telefone)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-xl border border-dashed border-border p-3 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
              )}
            >
              Abrir conversa (sem mensagem)
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
