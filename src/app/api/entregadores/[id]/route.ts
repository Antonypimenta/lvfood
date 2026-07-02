import { NextResponse } from "next/server";
import {
  excluirEntregador,
  finalizarRota,
} from "@/services/entregadores.service";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // POST em /api/entregadores/[id] = finalizar rota.
  try {
    const { id } = await params;
    const result = await finalizarRota(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao finalizar rota" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await excluirEntregador(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao excluir entregador" },
      { status: 500 }
    );
  }
}
