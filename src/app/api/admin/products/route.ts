import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { isAuthorized } from "@/lib/admin-auth";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Accepts an integer number or a plain-digits string; rejects booleans,
// arrays, "" and anything Number() would coerce loosely.
function parseInteger(value: unknown): number | null {
  if (typeof value === "number") return Number.isSafeInteger(value) ? value : null;
  if (typeof value === "string" && /^-?\d+$/.test(value.trim())) {
    const n = Number(value);
    return Number.isSafeInteger(n) ? n : null;
  }
  return null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "ADMIN_API_KEY no está configurada." }, { status: 500 });
  }
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let adminDb;
  try {
    adminDb = getAdminDb();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "El cuerpo de la solicitud no es JSON válido." }, { status: 400 });
  }
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "El cuerpo de la solicitud no es JSON válido." }, { status: 400 });
  }

  const { name, slug, categoryId, priceCents, stock, spec, description } = body;

  if (!isNonEmptyString(name)) {
    return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  }
  // The slug is used as the document id, so it must be URL/ID safe
  // (no "/", no spaces, no leading/trailing dashes).
  if (typeof slug !== "string" || !SLUG_REGEX.test(slug)) {
    return NextResponse.json(
      { error: "El slug es obligatorio y solo puede contener minúsculas, números y guiones." },
      { status: 400 }
    );
  }
  if (!isNonEmptyString(categoryId) || categoryId.includes("/")) {
    return NextResponse.json({ error: "La categoría es obligatoria." }, { status: 400 });
  }

  const price = parseInteger(priceCents);
  if (price === null || price <= 0) {
    return NextResponse.json(
      { error: "El precio debe ser un entero positivo en centavos." },
      { status: 400 }
    );
  }
  const stockNumber = parseInteger(stock);
  if (stockNumber === null || stockNumber < 0) {
    return NextResponse.json({ error: "El stock debe ser un entero mayor o igual a 0." }, { status: 400 });
  }
  if ((spec != null && typeof spec !== "string") || (description != null && typeof description !== "string")) {
    return NextResponse.json({ error: "spec y description deben ser texto." }, { status: 400 });
  }

  try {
    const category = await adminDb.collection("categories").doc(categoryId).get();
    if (!category.exists) {
      return NextResponse.json({ error: "La categoría no existe." }, { status: 400 });
    }

    // create() fails if the document already exists, unlike set(), which
    // would silently overwrite an existing product with the same slug.
    await adminDb
      .collection("products")
      .doc(slug)
      .create({
        name: name.trim(),
        slug,
        categoryId,
        priceCents: price,
        stock: stockNumber,
        spec: spec?.trim() || "",
        description: description?.trim() || "",
        isActive: true,
      });
  } catch (err) {
    // gRPC ALREADY_EXISTS
    if ((err as { code?: number }).code === 6) {
      return NextResponse.json({ error: "Ya existe un producto con ese slug." }, { status: 409 });
    }
    return NextResponse.json({ error: "No se pudo guardar el producto." }, { status: 500 });
  }

  return NextResponse.json({ id: slug }, { status: 201 });
}

export async function GET(req: NextRequest) {
  if (!process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "ADMIN_API_KEY no está configurada." }, { status: 500 });
  }
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const snapshot = await getAdminDb().collection("products").get();
    const products = snapshot.docs.map((doc) => doc.data());
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "No se pudo obtener la lista de productos." }, { status: 500 });
  }
}
