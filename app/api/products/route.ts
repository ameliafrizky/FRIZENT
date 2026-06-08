import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengambil produk" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, description, price, download_link, platform, image_url } = await req.json();

    // Validasi required
    if (!name || !price || !download_link) {
      return NextResponse.json(
        { error: "Nama, harga, dan link download wajib diisi" },
        { status: 400 }
      );
    }

    // Validasi link berdasarkan platform
    let isValid = true;
    
    if (platform === "android" || platform === "aplikasi") {
      // Untuk Android/Aplikasi: harus dari github.com
      isValid = download_link.includes("github.com");
      if (!isValid) {
        return NextResponse.json(
          { error: "Link download untuk Aplikasi Android harus dari GitHub (github.com)" },
          { status: 400 }
        );
      }
    } else if (platform === "game") {
      // Untuk Game: harus dari itch.io
      isValid = download_link.includes("itch.io");
      if (!isValid) {
        return NextResponse.json(
          { error: "Link download untuk Game harus dari Itch.io (itch.io)" },
          { status: 400 }
        );
      }
    } else {
      // Platform lain (windows, ios, dll): bebas
      isValid = true;
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price: parseInt(price.toString()),
        download_link,
        platform: platform || "android",
        image_url: image_url || null,
      },
    });

    return NextResponse.json({ message: "Produk berhasil ditambahkan", product }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menambah produk" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID produk diperlukan" }, { status: 400 });
    }

    await prisma.product.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
  }
}