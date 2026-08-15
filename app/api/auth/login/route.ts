import { NextResponse } from "next/server";
import { COOKIE_NAME, createSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json() as { password?: string };
  if (!process.env.AUTH_PASSWORD || password !== process.env.AUTH_PASSWORD) return NextResponse.json({ error: "That password is not correct." }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, await createSessionToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return response;
}
