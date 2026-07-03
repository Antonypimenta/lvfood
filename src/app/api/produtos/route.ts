import { NextResponse } from "next/server";
import { listarProdutos, criarProduto } from "@/services/produtos.service";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  const produtos = await listarProdutos();
  return NextResponse.json(produtos);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const produto = await criarProduto(body);
    return NextResponse.json(produto, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: error.issues },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar produto" },
      { status: 500 }
    );
  }
}
