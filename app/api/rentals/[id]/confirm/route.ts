import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await req.json();
    const { status: rentalStatus } = body;

    const rental = await prisma.rental.update({
      where: { id: parseInt(id) },
      data: {
        status: rentalStatus,
        is_active: rentalStatus === "active",
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: rentalStatus === "active" ? "Peminjaman disetujui" : "Peminjaman ditolak",
      rental 
    });
  } catch (error) {
    console.error("Error konfirmasi:", error);
    return NextResponse.json(
      { error: "Gagal mengkonfirmasi peminjaman" },
      { status: 500 }
    );
  }
}