import { listarProdutosAtivos } from "@/services/produtos.service";
import { obterConfig } from "@/services/config.service";
import { PedidoClient } from "@/components/pedido/pedido-client";
import type { Produto } from "@/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Fazer pedido — LVFood",
  description: "Monte seu pedido de delivery",
};

export default async function PedidoPage() {
  const [produtos, config] = await Promise.all([
    listarProdutosAtivos(),
    obterConfig(),
  ]);

  return (
    <PedidoClient
      produtos={produtos as unknown as Produto[]}
      nomeEvento={config.nomeEvento}
    />
  );
}
