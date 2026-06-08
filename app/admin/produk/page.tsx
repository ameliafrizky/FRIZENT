"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AdminProdukPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 5000,
    download_link: "",
    platform: "android",
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.replace("/login");
      return;
    }
    fetchProducts();
  }, [session, status, router]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/products/${editingId}` : "/api/products";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        alert("Gagal menyimpan");
        return;
      }

      fetchProducts();
      setShowForm(false);
      setEditingId(null);
      setForm({ name: "", description: "", price: 5000, download_link: "", platform: "android" });
      alert("✅ Produk berhasil disimpan!");
    } catch (error) {
      alert("Gagal menyimpan produk");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Hapus produk ini?")) {
      try {
        await fetch(`/api/products/${id}`, { method: "DELETE" });
        fetchProducts();
        alert("✅ Produk dihapus");
      } catch (error) {
        alert("Gagal menghapus produk");
      }
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(search.toLowerCase()))
  );

  if (status === "loading" || loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fefce8" }}>
        <div style={{ width: 48, height: 48, border: "3px solid #fde68a", borderTopColor: "#f59e0b", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!session || session.user?.role !== "admin") return null;

  return (
    <div style={{ minHeight: "100vh", background: "#fefce8", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "white", borderBottom: "1px solid #e8e4d8", padding: "12px 32px", position: "sticky" as const, top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🎮</span>
            <span style={{ fontSize: 18, fontWeight: "bold", color: "#d4a84a" }}>FRIZRENT ADMIN</span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/admin" style={{ padding: "8px 20px", background: "#fefce8", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#78350f", textDecoration: "none" }}>Dashboard</Link>
            <Link href="/admin/produk" style={{ padding: "8px 20px", background: "#d4a84a", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "white", textDecoration: "none" }}>Produk</Link>
            <Link href="/admin/konfirmasi" style={{ padding: "8px 20px", background: "#fefce8", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#78350f", textDecoration: "none" }}>Konfirmasi</Link>
            <Link href="/admin/carts" style={{ padding: "8px 20px", background: "#fefce8", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#78350f", textDecoration: "none" }}>Cart User</Link>
            <button onClick={() => router.push("/logout")} style={{ padding: "8px 20px", background: "#e8a0a0", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "white", cursor: "pointer" }}>Logout</button>
            <div style={{ width: 36, height: 36, background: "#d4a84a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "white" }}>{session.user?.name?.charAt(0).toUpperCase()}</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "#4a7c3f", margin: 0 }}>🎮 Kelola Produk Game</h1>
          <div style={{ display: "flex", gap: 12 }}>
            <input
              type="text"
              placeholder="🔍 Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e8e4d8", background: "white", width: 200, outline: "none" }}
            />
            <button onClick={() => setShowForm(true)} style={{ padding: "8px 20px", background: "#d4a84a", border: "none", borderRadius: 8, fontWeight: 600, color: "white", cursor: "pointer" }}>+ Tambah Produk</button>
          </div>
        </div>

        {showForm && (
          <div style={{ background: "white", borderRadius: 16, padding: 24, marginBottom: 32, border: "1px solid #e8e4d8" }}>
            <h2 style={{ fontSize: 20, color: "#4a7c3f", marginBottom: 20 }}>{editingId ? "✏️ Edit Produk" : "➕ Tambah Produk"}</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Nama Produk" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: "100%", padding: 12, marginBottom: 12, border: "1px solid #e8e4d8", borderRadius: 8 }} required />
              <textarea placeholder="Deskripsi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ width: "100%", padding: 12, marginBottom: 12, border: "1px solid #e8e4d8", borderRadius: 8 }} />
              <input type="number" placeholder="Harga" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} style={{ width: "100%", padding: 12, marginBottom: 12, border: "1px solid #e8e4d8", borderRadius: 8 }} required />
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} style={{ width: "100%", padding: 12, marginBottom: 12, border: "1px solid #e8e4d8", borderRadius: 8 }}>
                <option value="android">Android</option>
                <option value="game">Game</option>
                <option value="windows">Windows</option>
                <option value="ios">iOS</option>
              </select>
              <input type="url" placeholder="Link Download" value={form.download_link} onChange={(e) => setForm({ ...form, download_link: e.target.value })} style={{ width: "100%", padding: 12, marginBottom: 12, border: "1px solid #e8e4d8", borderRadius: 8 }} required />
              <div style={{ display: "flex", gap: 12 }}>
                <button type="submit" style={{ flex: 1, padding: 12, background: "#d4a84a", border: "none", borderRadius: 8, color: "white", fontWeight: 600, cursor: "pointer" }}>Simpan</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: 12, background: "#fefce8", border: "none", borderRadius: 8, cursor: "pointer" }}>Batal</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {filteredProducts.map((product) => (
            <div key={product.id} style={{ background: "white", borderRadius: 16, overflow: "hidden", border: "1px solid #e8e4d8" }}>
              <div style={{ height: 120, background: "#fefce8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
                {product.platform === "android" && "📱"}
                {product.platform === "game" && "🎮"}
                {product.platform === "windows" && "💻"}
                {product.platform === "ios" && "📱"}
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: "bold", color: "#4a7c3f", marginBottom: 6 }}>{product.name}</h3>
                <p style={{ fontSize: 12, color: "#8a9c7a", marginBottom: 12 }}>{product.description || "Game seru untuk dimainkan"}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ padding: "4px 10px", background: "#fefce8", borderRadius: 20, fontSize: 11, color: "#d4a84a" }}>{product.platform}</span>
                  <span style={{ fontSize: 16, fontWeight: "bold", color: "#d4a84a" }}>Rp {product.price.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => { setEditingId(product.id); setForm(product); setShowForm(true); }} style={{ flex: 1, padding: 8, background: "#fefce8", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>✏️ Edit</button>
                  <button onClick={() => handleDelete(product.id)} style={{ flex: 1, padding: 8, background: "#fee2e2", border: "none", borderRadius: 8, fontSize: 12, color: "#e8a0a0", cursor: "pointer" }}>🗑️ Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}