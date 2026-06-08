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

    const rentals = await prisma.rental.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        product: {
          select: { id: true, name: true, price: true }
        }
      },
      orderBy: { rent_date: "desc" },
    });

    return NextResponse.json(rentals);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}