import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "mitv-mundial-2026",
    supabaseConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    resultsProvider: process.env.RESULTS_API_PROVIDER || "generic"
  });
}
