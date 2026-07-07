"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useStore } from "@/store/useStore";
import { toast } from "@/components/ui/toast";
import { configSchema, type ConfigFormValues } from "@/schemas/pedido";
import { EventosCard } from "./eventos-card";

export function ConfigView() {
  const config = useStore((s) => s.config);
  const salvarConfig = useStore((s) => s.salvarConfig);
  const limparSistema = useStore((s) => s.limparSistema);
  const [confirmar, setConfirmar] = React.useState(false);

  const { register, handleSubmit, reset, formState } =
    useForm<ConfigFormValues>({
      resolver: zodResolver(configSchema),
      defaultValues: { nomeEvento: "" },
    });

  React.useEffect(() => {
    if (config) {
      reset({ nomeEvento: config.nomeEvento });
    }
  }, [config, reset]);

  async function onSubmit(data: ConfigFormValues) {
    try {
      await salvarConfig(data);
      toast.success("Configurações salvas");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    }
  }

  return (
    <div className="grid max-w-2xl gap-6">
      <EventosCard />

      <Card>
        <CardHeader>
          <CardTitle>Nome do evento ativo</CardTitle>
          <CardDescription>
            Nome exibido no painel e na página pública de pedidos. Renomeia o
            evento selecionado. O cardápio e os preços são gerenciados no módulo{" "}
            <b>Produtos</b>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nomeEvento">Nome do evento</Label>
              <Input id="nomeEvento" {...register("nomeEvento")} />
              {formState.errors.nomeEvento && (
                <p className="text-xs text-destructive">
                  {formState.errors.nomeEvento.message}
                </p>
              )}
            </div>
            <div>
              <Button type="submit" disabled={formState.isSubmitting} className="gap-2">
                <Save className="h-4 w-4" />
                Salvar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Zona de risco</CardTitle>
          <CardDescription>
            Remove os pedidos <b>do evento ativo</b> e reseta os entregadores.
            Não pode ser desfeito.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setConfirmar(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Limpar sistema
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmar}
        onOpenChange={setConfirmar}
        title="Limpar todo o sistema?"
        description="Todos os pedidos serão apagados e os entregadores voltarão a ficar disponíveis. Esta ação é irreversível."
        confirmLabel="Sim, limpar tudo"
        onConfirm={async () => {
          try {
            await limparSistema();
            toast.success("Sistema limpo");
          } catch {
            toast.error("Erro ao limpar");
          }
        }}
      />
    </div>
  );
}
