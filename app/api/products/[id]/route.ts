import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET produk by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengambil produk" }, { status: 500 });
  }
}

// PUT update produk
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, description, price, download_link, platform, image_url } = await req.json();

    if (!name || !price) {
      return NextResponse.json(
        { error: "Nama dan harga wajib diisi" },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description: description || "",
        price: parseInt(price.toString()),
        download_link: download_link || "",
        platform: platform || "android",
        image_url: image_url || null,
      },
    });

    return NextResponse.json({ message: "Produk berhasil diupdate", product });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengupdate produk" }, { status: 500 });
  }
}

// DELETE produk
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
  }
}