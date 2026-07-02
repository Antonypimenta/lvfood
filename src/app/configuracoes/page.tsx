import { ConfigView } from "@/components/config/config-view";

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Configurações</h2>
        <p className="text-sm text-muted-foreground">
          Ajuste o evento e o valor do combo.
        </p>
      </div>
      <ConfigView />
    </div>
  );
}
