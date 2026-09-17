import { NextResponse } from "next/server";

import { AiNotConfiguredError } from "@/lib/ai-client";
import { askWellnessAssistant, type WellnessChatTurn } from "@/lib/wellness-assistant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_QUESTION_LENGTH = 1000;
const MAX_HISTORY_TURNS = 10;

function parseHistory(raw: unknown): WellnessChatTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is WellnessChatTurn =>
        item &&
        typeof item === "object" &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string",
    )
    .slice(-MAX_HISTORY_TURNS);
}

export async function POST(request: Request) {
  let body: { question?: unknown; history?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Dữ liệu gửi lên không đọc được." }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) {
    return NextResponse.json({ ok: false, message: "Bạn hãy nhập câu hỏi." }, { status: 422 });
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json(
      { ok: false, message: `Câu hỏi quá dài, vui lòng rút gọn dưới ${MAX_QUESTION_LENGTH} ký tự.` },
      { status: 422 },
    );
  }

  try {
    const result = await askWellnessAssistant(question, parseHistory(body.history));
    return NextResponse.json({ ok: true, answer: result.answer });
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 503 });
    }
    console.error("[wellness-assistant] lỗi:", error);
    return NextResponse.json(
      { ok: false, message: "Hệ thống đang lỗi khi tư vấn, bạn thử lại sau ít phút nhé." },
      { status: 500 },
    );
  }
}
