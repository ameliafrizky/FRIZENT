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

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const rentals = await prisma.rental.findMany({
      where: { user_id: user.id },
      include: { product: true },
      orderBy: { rent_date: "desc" },
    });

    console.log(`📋 Found ${rentals.length} rentals for user ${user.email}`);

    return NextResponse.json(rentals);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}