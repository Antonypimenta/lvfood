import { NextResponse } from "next/server";
import { obterConfig, atualizarConfig } from "@/services/config.service";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await obterConfig();
  return NextResponse.json(config);
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const config = await atualizarConfig(body);
    return NextResponse.json(config);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: error.issues },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao salvar configuração" },
      { status: 500 }
    );
  }
}
