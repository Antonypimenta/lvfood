import { PedidosView } from "@/components/pedidos/pedidos-view";

export default function PedidosPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Pedidos</h2>
        <p className="text-sm text-muted-foreground">
          Pesquise, filtre e gerencie todos os pedidos do evento.
        </p>
      </div>
      <PedidosView />
    </div>
  );
}
