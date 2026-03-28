import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  try {
    // Jina AI Reader: converts any URL to clean text — free, no key needed
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: { Accept: "text/plain" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return NextResponse.json({ error: "Could not fetch that URL" }, { status: 502 });
    const text = await res.text();
    // Cap at 6000 chars — enough for any JD, keeps Claude prompt lean
    return NextResponse.json({ description: text.slice(0, 6000).trim() });
  } catch {
    return NextResponse.json({ error: "Failed to fetch URL" }, { status: 502 });
  }
}
