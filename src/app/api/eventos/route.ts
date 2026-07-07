import { NextResponse } from "next/server";
import { listarEventos, criarEvento } from "@/services/eventos.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const eventos = await listarEventos();
  return NextResponse.json(eventos);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nome = typeof body?.nome === "string" ? body.nome : "";
    const evento = await criarEvento(nome);
    return NextResponse.json(evento, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao criar evento" },
      { status: 400 }
    );
  }
}
