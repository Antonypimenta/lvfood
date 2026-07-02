import { NextResponse } from "next/server";
import {
  listarEntregadores,
  criarEntregador,
} from "@/services/entregadores.service";
import { entregadorSchema } from "@/schemas/pedido";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  const entregadores = await listarEntregadores();
  return NextResponse.json(entregadores);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome } = entregadorSchema.parse(body);
    const entregador = await criarEntregador(nome);
    return NextResponse.json(entregador, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: error.issues },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar entregador" },
      { status: 500 }
    );
  }
}
