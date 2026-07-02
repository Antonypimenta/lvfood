import { KanbanBoard } from "@/components/kanban/kanban-board";

export default function KanbanPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Kanban de pedidos</h2>
        <p className="text-sm text-muted-foreground">
          Arraste os cartões para atualizar o status. Salva automaticamente.
        </p>
      </div>
      <KanbanBoard />
    </div>
  );
}
