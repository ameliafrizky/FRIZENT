import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(request: Request) {
  try {
    console.log("🚀 CHECKOUT DIPANGGIL!");

    const session = await getServerSession();
    
    if (!session) {
      console.log("❌ Tidak ada session!");
      return NextResponse.json({ error: "Unauthorized - Silakan login" }, { status: 401 });
    }

    console.log("✅ Session user:", session.user?.email);

    const body = await request.json();
    const { products } = body;

    console.log("📦 Produk yang di-checkout:", products);

    if (!products || products.length === 0) {
      return NextResponse.json({ error: "Keranjang kosong" }, { status: 400 });
    }

    // Ambil user dari database berdasarkan email session
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
    });
    
    if (!user) {
      console.log("❌ User tidak ditemukan di database!");
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    console.log("👤 User checkout:", user.email, "ID:", user.id);

    const createdRentals = [];
    
    for (const product of products) {
      const existingProduct = await prisma.product.findUnique({
        where: { id: product.id },
      });

      if (!existingProduct) {
        console.log(`⚠️ Product ${product.id} not found, skipping...`);
        continue;
      }

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      const rental = await prisma.rental.create({
        data: {
          user_id: user.id,
          product_id: product.id,
          rent_date: new Date(),
          expiry_date: expiryDate,
          is_active: true,
          status: "pending",
        },
      });

      createdRentals.push(rental);
      console.log(`✅ Rental created: ${existingProduct.name} untuk user ${user.email}`);
    }

    if (createdRentals.length === 0) {
      return NextResponse.json({ error: "Tidak ada produk yang valid" }, { status: 400 });
    }

    // Hapus keranjang user setelah checkout
    await prisma.cart.deleteMany({
      where: { user_id: user.id },
    });

    console.log(`✅ Total ${createdRentals.length} rental berhasil dibuat`);

    return NextResponse.json({
      success: true,
      message: `Berhasil menyewa ${createdRentals.length} produk`,
      rentals: createdRentals,
    });

  } catch (error) {
    console.error("❌ Checkout error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan: " + (error as Error).message },
      { status: 500 }
    );
  }
}