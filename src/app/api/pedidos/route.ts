import { NextResponse } from "next/server";
import { listarPedidos, criarPedido } from "@/services/pedidos.service";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  const pedidos = await listarPedidos();
  return NextResponse.json(pedidos);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pedido = await criarPedido(body);
    return NextResponse.json(pedido, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: error.issues },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 500 });
  }
}
