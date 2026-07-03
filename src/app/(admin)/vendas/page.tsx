import { VendasView } from "@/components/vendas/vendas-view";

export default function VendasPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Vendas</h2>
        <p className="text-sm text-muted-foreground">
          Painel financeiro do evento, atualizado em tempo real.
        </p>
      </div>
      <VendasView />
    </div>
  );
}
