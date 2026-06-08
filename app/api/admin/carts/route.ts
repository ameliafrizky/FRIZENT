import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const carts = await prisma.cart.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        product: {
          select: { id: true, name: true, price: true, platform: true }
        }
      },
      orderBy: { created_at: "desc" },  // ✅ PAKAI "created_at" (sesuai schema)
    });

    return NextResponse.json(carts);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Gagal ambil data keranjang: " + (error as Error).message }, { status: 500 });
  }
}