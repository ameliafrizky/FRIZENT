import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user?.email;

    if (!userEmail) {
      return NextResponse.json({ error: "Email tidak ditemukan" }, { status: 400 });
    }

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // Ambil rentals berdasarkan user_id
    const rentals = await prisma.rental.findMany({
      where: { user_id: user.id },
      include: {
        product: true,
      },
      orderBy: { rent_date: "desc" },
    });

    return NextResponse.json(rentals);
  } catch (error) {
    console.error("Error fetching user rentals:", error);
    return NextResponse.json({ error: "Gagal ambil data peminjaman" }, { status: 500 });
  }
}