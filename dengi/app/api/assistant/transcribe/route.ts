import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Whisper не настроен. Добавьте OPENAI_API_KEY в .env.local для голоса.",
      },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("audio");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Нужен аудиофайл." }, { status: 400 });
  }

  const whisperForm = new FormData();
  whisperForm.append("file", file, file.name || "speech.webm");
  whisperForm.append("model", "whisper-1");
  whisperForm.append("response_format", "json");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: whisperForm,
  });

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      { error: "Whisper не смог распознать аудио.", details },
      { status: 502 }
    );
  }

  const payload = (await response.json()) as { text?: string };

  return NextResponse.json({
    text: payload.text?.trim() ?? "",
  });
}
