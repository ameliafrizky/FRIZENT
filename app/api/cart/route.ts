import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email as string },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const cart = await prisma.cart.findMany({
    where: { user_id: user.id },
    include: { product: true }
  });

  return NextResponse.json(cart);
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email as string },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { productId } = await request.json();

  const existing = await prisma.cart.findFirst({
    where: { user_id: user.id, product_id: productId }
  });

  if (existing) {
    const cart = await prisma.cart.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + 1 }
    });
    return NextResponse.json(cart);
  }

  const cart = await prisma.cart.create({
    data: {
      user_id: user.id,
      product_id: productId,
      quantity: 1
    }
  });

  return NextResponse.json(cart);
}

export async function DELETE(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cartId = searchParams.get("id");

  if (!cartId) {
    return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
  }

  await prisma.cart.delete({ where: { id: parseInt(cartId) } });

  return NextResponse.json({ message: "Deleted" });
}