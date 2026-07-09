import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";

const SESSION_SECRET = process.env["SESSION_SECRET"];
if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set");
}

const COOKIE_NAME = "bd_session";
const TOKEN_EXPIRY = "7d";

export type SessionPayload = {
  authenticated: true;
  iat: number;
  exp: number;
};

export function signToken(): string {
  return jwt.sign({ authenticated: true }, SESSION_SECRET!, {
    expiresIn: TOKEN_EXPIRY,
  });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, SESSION_SECRET!) as SessionPayload;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: Response, token: string, remember: boolean): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax",
    maxAge: remember ? 7 * 24 * 60 * 60 * 1000 : undefined,
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME);
}

export function getTokenFromRequest(req: Request): string | null {
  return (req.cookies as Record<string, string>)?.[COOKIE_NAME] ?? null;
}

export function checkPassword(plain: string, adminPassword: string): boolean {
  // Direct comparison — admin password is stored as env var (not hashed at rest)
  return plain === adminPassword;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export function isAuthenticated(req: Request): boolean {
  const token = getTokenFromRequest(req);
  if (!token) return false;
  const payload = verifyToken(token);
  return payload !== null;
}
