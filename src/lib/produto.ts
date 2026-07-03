import type { Produto } from "@/types";

/** Um combo contém um hambúrguer entre seus componentes? */
export function comboTemHamburguer(p: Produto): boolean {
  return (p.componentes ?? []).some((c) => c.categoria === "HAMBURGUERES");
}

/**
 * Produtos que aceitam extras: hambúrgueres avulsos e combos que
 * contêm um hambúrguer (os extras vão para o hambúrguer de dentro).
 */
export function aceitaExtras(p: Produto): boolean {
  return (
    p.categoria === "HAMBURGUERES" ||
    (p.categoria === "COMBOS" && comboTemHamburguer(p))
  );
}

/** Texto da composição de um combo: "X-Burguer + Batata + Guaraná". */
export function composicaoTexto(p: Produto): string {
  return (p.componentes ?? []).map((c) => c.nome).join(" + ");
}
