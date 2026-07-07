import { NextResponse } from "next/server";
import {
  renomearEvento,
  selecionarEvento,
  excluirEvento,
} from "@/services/eventos.service";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (body?.ativar === true) {
      const evento = await selecionarEvento(id);
      return NextResponse.json(evento);
    }
    const nome = typeof body?.nome === "string" ? body.nome : "";
    const evento = await renomearEvento(id, nome);
    return NextResponse.json(evento);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao atualizar evento",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await excluirEvento(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao excluir evento",
      },
      { status: 400 }
    );
  }
}
