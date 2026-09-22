import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export function isAuthorized(req: NextRequest): boolean {
    const expected = process.env.ADMIN_API_KEY;
    if (!expected) return false;

    const provided = req.headers.get("x-admin-key") ?? "";
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
}