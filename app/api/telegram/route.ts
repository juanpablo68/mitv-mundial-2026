import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { text, chatId } = await request.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const defaultChatId = process.env.TELEGRAM_CHAT_ID;
    const targetChatId = chatId || defaultChatId;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Falta configurar TELEGRAM_BOT_TOKEN en .env.local" },
        { status: 500 }
      );
    }

    if (!targetChatId) {
      return NextResponse.json(
        { ok: false, error: "Falta configurar TELEGRAM_CHAT_ID o enviar chatId desde la app" },
        { status: 400 }
      );
    }

    if (!text || typeof text !== "string") {
      return NextResponse.json({ ok: false, error: "Mensaje vacío" }, { status: 400 });
    }

    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: targetChatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true
      })
    });

    const payload = await telegramResponse.json();
    if (!telegramResponse.ok) {
      return NextResponse.json({ ok: false, error: payload.description || "Error de Telegram" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, telegram: payload });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "No se pudo enviar el mensaje" }, { status: 500 });
  }
}
