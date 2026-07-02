import { NextResponse } from "next/server";
import { limparSistema } from "@/services/config.service";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await limparSistema();
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao limpar sistema" },
      { status: 500 }
    );
  }
}
