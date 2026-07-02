import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata número como moeda brasileira: 54 -> "R$ 54,00" */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value ?? 0);
}

/** Padroniza o número do pedido: 1 -> "0001" */
export function formatNumeroPedido(numero: number): string {
  return String(numero).padStart(4, "0");
}

/** Remove tudo que não for dígito de um telefone. */
export function onlyDigits(value: string): string {
  return (value ?? "").replace(/\D/g, "");
}

/** Monta a URL do WhatsApp a partir de um telefone brasileiro. */
export function whatsappUrl(telefone: string): string {
  const digits = onlyDigits(telefone);
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
}

/** Formata telefone para exibição: (24) 99999-9999 */
export function formatTelefone(telefone: string): string {
  const d = onlyDigits(telefone);
  if (d.length === 11) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return telefone;
}
