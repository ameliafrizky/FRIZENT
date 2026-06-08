import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Ambil session user yang login
    const session = await getServerSession();
    
    console.log("Session:", session);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    // Cari user berdasarkan email dari session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    console.log("User found:", user.id, user.email);

    // Ambil rentals hanya untuk user yang login
    const rentals = await prisma.rental.findMany({
      where: { user_id: user.id },
      include: {
        product: true
      },
      orderBy: {
        rent_date: "desc"
      }
    });

    console.log(`Found ${rentals.length} rentals for user ${user.email}`);

    return NextResponse.json(rentals);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Gagal ambil data" },
      { status: 500 }
    );
  }
}