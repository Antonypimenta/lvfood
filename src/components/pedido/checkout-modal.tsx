"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Landmark, Wallet, CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup } from "@/components/pedidos/radio-group";
import { toast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { checkoutFormSchema, type CheckoutFormValues } from "@/schemas/pedido";
import { useCarrinho } from "@/store/useCarrinho";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmado: (numero: number) => void;
}

const defaults: CheckoutFormValues = {
  nome: "",
  telefone: "",
  bairro: "",
  endereco: "",
  complemento: "",
  observacoes: "",
  formaPagamento: "PIX",
  troco: null,
};

export function CheckoutModal({
  open,
  onOpenChange,
  onConfirmado,
}: CheckoutModalProps) {
  const itens = useCarrinho((s) => s.itens);
  const total = useCarrinho((s) => s.total);
  const limpar = useCarrinho((s) => s.limpar);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: defaults,
  });

  React.useEffect(() => {
    if (open) reset(defaults);
  }, [open, reset]);

  const formaPagamento = watch("formaPagamento");

  async function onSubmit(data: CheckoutFormValues) {
    if (itens.length === 0) {
      toast.error("Seu carrinho está vazio");
      return;
    }
    try {
      const payload = {
        ...data,
        pagamento: "PENDENTE" as const,
        troco: data.formaPagamento === "DINHEIRO" ? data.troco ?? null : null,
        itens: itens.map((i) => ({
          produtoId: i.produto.id,
          quantidade: i.quantidade,
          extras: i.extras.map((e) => ({ produtoId: e.id })),
        })),
      };

      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Erro ao enviar pedido");
      }
      const pedido = await res.json();
      limpar();
      onOpenChange(false);
      onConfirmado(pedido.numero);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao enviar pedido");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? null : onOpenChange(false))}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Finalizar pedido</DialogTitle>
          <DialogDescription>
            Total: <b className="text-primary">{formatCurrency(total())}</b>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" autoFocus {...register("nome")} />
            {errors.nome && (
              <p className="text-xs text-destructive">{errors.nome.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                inputMode="tel"
                placeholder="(24) 99999-9999"
                {...register("telefone")}
              />
              {errors.telefone && (
                <p className="text-xs text-destructive">
                  {errors.telefone.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bairro">Bairro *</Label>
              <Input id="bairro" {...register("bairro")} />
              {errors.bairro && (
                <p className="text-xs text-destructive">
                  {errors.bairro.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="endereco">Endereço *</Label>
            <Input
              id="endereco"
              placeholder="Rua das Flores, 120"
              {...register("endereco")}
            />
            {errors.endereco && (
              <p className="text-xs text-destructive">
                {errors.endereco.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="complemento">Complemento</Label>
            <Input
              id="complemento"
              placeholder="Apto, bloco, referência..."
              {...register("complemento")}
            />
          </div>

          <div className="grid gap-2">
            <Label>Forma de pagamento</Label>
            <RadioGroup
              value={formaPagamento}
              onChange={(v) =>
                setValue(
                  "formaPagamento",
                  v as CheckoutFormValues["formaPagamento"]
                )
              }
              options={[
                {
                  value: "PIX",
                  label: "PIX",
                  icon: <Landmark className="h-4 w-4" />,
                },
                {
                  value: "DINHEIRO",
                  label: "Dinheiro",
                  icon: <Wallet className="h-4 w-4" />,
                },
                {
                  value: "CARTAO",
                  label: "Cartão",
                  icon: <CreditCard className="h-4 w-4" />,
                },
              ]}
            />
          </div>

          {formaPagamento === "DINHEIRO" && (
            <div className="grid gap-2">
              <Label htmlFor="troco">Troco para (opcional)</Label>
              <Input
                id="troco"
                type="number"
                step="0.01"
                min={0}
                placeholder="Ex.: 50,00"
                {...register("troco")}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="observacoes">Observações gerais</Label>
            <Textarea
              id="observacoes"
              placeholder="Sem cebola, ponto da carne, etc."
              {...register("observacoes")}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Voltar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Confirmar pedido"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
