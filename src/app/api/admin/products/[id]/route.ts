import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { isAuthorized } from "@/lib/admin-auth";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "ADMIN_API_KEY no está configurada." }, { status: 500 });
  }
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "El cuerpo de la solicitud no es JSON válido." }, { status: 400 });
  }

  const { name, categoryId, priceCents, stock, spec, description } = body;

  if (!isNonEmptyString(name)) {
    return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  }
  if (!isNonEmptyString(categoryId) || categoryId.includes("/")) {
    return NextResponse.json({ error: "La categoría es obligatoria." }, { status: 400 });
  }

  const price = Number(priceCents);
  if (priceCents === "" || priceCents == null || !Number.isInteger(price) || price <= 0) {
    return NextResponse.json({ error: "El precio debe ser un entero positivo en centavos." }, { status: 400 });
  }
  const stockNumber = Number(stock);
  if (stock === "" || stock == null || !Number.isInteger(stockNumber) || stockNumber < 0) {
    return NextResponse.json({ error: "El stock debe ser un entero mayor o igual a 0." }, { status: 400 });
  }

  try {
    const category = await adminDb.collection("categories").doc(categoryId).get();
    if (!category.exists) {
      return NextResponse.json({ error: "La categoría no existe." }, { status: 400 });
    }

    // update() falla si el documento no existe — evita crear uno nuevo por accidente
    // si el id ya no existiera.
    await adminDb.collection("products").doc(id).update({
      name: name.trim(),
      categoryId,
      priceCents: price,
      stock: stockNumber,
      spec: typeof spec === "string" ? spec.trim() : "",
      description: typeof description === "string" ? description.trim() : "",
    });
  } catch (err) {
    if ((err as { code?: number }).code === 5) {
      // gRPC NOT_FOUND
      return NextResponse.json({ error: "El producto no existe." }, { status: 404 });
    }
    return NextResponse.json({ error: "No se pudo actualizar el producto." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "ADMIN_API_KEY no está configurada." }, { status: 500 });
  }
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;

  try {
    await adminDb.collection("products").doc(id).delete();
  } catch {
    return NextResponse.json({ error: "No se pudo borrar el producto." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}