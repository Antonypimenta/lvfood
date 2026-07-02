import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StatusPedido, StatusPagamento, StatusEntregador } from "@/types";
import {
  STATUS_PEDIDO_BADGE,
  STATUS_PEDIDO_LABEL,
  STATUS_PAGAMENTO_BADGE,
  STATUS_PAGAMENTO_LABEL,
  STATUS_ENTREGADOR_DOT,
  STATUS_ENTREGADOR_LABEL,
} from "@/lib/constants";

export function StatusPedidoBadge({ status }: { status: StatusPedido }) {
  return (
    <Badge className={STATUS_PEDIDO_BADGE[status]}>
      {STATUS_PEDIDO_LABEL[status]}
    </Badge>
  );
}

export function PagamentoBadge({
  pagamento,
}: {
  pagamento: StatusPagamento;
}) {
  return (
    <Badge className={STATUS_PAGAMENTO_BADGE[pagamento]}>
      {pagamento === "PAGO" && <Check className="h-3 w-3" />}
      {STATUS_PAGAMENTO_LABEL[pagamento]}
    </Badge>
  );
}

export function EntregadorStatusBadge({
  status,
}: {
  status: StatusEntregador;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          STATUS_ENTREGADOR_DOT[status]
        )}
      />
      {STATUS_ENTREGADOR_LABEL[status]}
    </span>
  );
}
