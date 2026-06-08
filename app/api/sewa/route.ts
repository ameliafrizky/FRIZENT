import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId } = await req.json();
    const userId = session.user.id;

    const existingRental = await prisma.rental.findFirst({
      where: {
        user_id: userId,
        product_id: productId,
        is_active: true,
      },
    });

    if (existingRental) {
      return NextResponse.json(
        { error: "Anda sudah menyewa produk ini" },
        { status: 400 }
      );
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    const rental = await prisma.rental.create({
      data: {
        user_id: userId,
        product_id: productId,
        expiry_date: expiryDate,
        is_active: false,
        status: "pending",
      },
    });

    return NextResponse.json(
      { message: "Pesanan berhasil, menunggu konfirmasi admin", rental },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal menyewa" },
      { status: 500 }
    );
  }
}