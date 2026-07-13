import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { status: "ok", service: "marokand-humo-lms" },
    { headers: { "Cache-Control": "no-store" } }
  );
}
