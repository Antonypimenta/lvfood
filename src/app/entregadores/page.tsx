import { EntregadoresView } from "@/components/entregadores/entregadores-view";

export default function EntregadoresPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Entregadores</h2>
        <p className="text-sm text-muted-foreground">
          Cadastre a equipe e finalize rotas com um clique.
        </p>
      </div>
      <EntregadoresView />
    </div>
  );
}
