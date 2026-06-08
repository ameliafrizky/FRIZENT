"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CartItem {
  id: number;
  quantity: number;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  product: {
    id: number;
    name: string;
    price: number;
    platform: string;
  };
}

export default function AdminCartsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [carts, setCarts] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchCarts();
  }, [session, status, router]);

  const fetchCarts = async () => {
    try {
      const res = await fetch("/api/admin/carts");
      const data = await res.json();
      setCarts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setCarts([]);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fefce8" }}>
        <div style={{ width: 48, height: 48, border: "3px solid #e8e4d8", borderTopColor: "#d4a84a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!session || session.user?.role !== "admin") return null;

  const navLinkStyle = {
    padding: "8px 20px",
    background: "#fefce8",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    color: "#78350f",
    textDecoration: "none" as const,
  };

  const navLinkActiveStyle = {
    ...navLinkStyle,
    background: "#d4a84a",
    color: "white",
  };

  const logoutBtnStyle = {
    padding: "8px 20px",
    background: "#e8a0a0",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    color: "white",
    cursor: "pointer",
  };

  const avatarStyle = {
    width: 36,
    height: 36,
    background: "#d4a84a",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    color: "white",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fefce8", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "white", borderBottom: "1px solid #e8e4d8", padding: "12px 32px", position: "sticky" as const, top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🎮</span>
            <span style={{ fontSize: 18, fontWeight: "bold", color: "#d4a84a" }}>FRIZRENT ADMIN</span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/admin" style={navLinkStyle}>Dashboard</Link>
            <Link href="/admin/produk" style={navLinkStyle}>Produk</Link>
            <Link href="/admin/konfirmasi" style={navLinkStyle}>Konfirmasi</Link>
            <Link href="/admin/carts" style={navLinkActiveStyle}>Cart User</Link>
            <button onClick={() => router.push("/logout")} style={logoutBtnStyle}>Logout</button>
            <div style={avatarStyle}>{session.user?.name?.charAt(0).toUpperCase()}</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "#4a7c3f", marginBottom: 8 }}>🛒 Keranjang Semua User</h1>
          <p style={{ fontSize: 14, color: "#8a9c7a" }}>Lihat dan kelola keranjang belanja user</p>
        </div>

        <div style={{ overflowX: "auto", background: "white", borderRadius: 16, border: "1px solid #e8e4d8", marginBottom: 32 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ background: "#fefce8", borderBottom: "1px solid #e8e4d8" }}>
                <th style={{ padding: "16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#4a7c3f" }}>User</th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#4a7c3f" }}>Produk</th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#4a7c3f" }}>Platform</th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#4a7c3f" }}>Quantity</th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#4a7c3f" }}>Harga/unit</th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#4a7c3f" }}>Subtotal</th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#4a7c3f" }}>Ditambahkan</th>
              </tr>
            </thead>
            <tbody>
              {carts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "60px 20px", color: "#8a9c7a" }}>
                    <span style={{ fontSize: 48, display: "block", marginBottom: 12, opacity: 0.5 }}>🛒</span>
                    <p>Belum ada data keranjang</p>
                  </td>
                </tr>
              ) : (
                carts.map((cart) => (
                  <tr key={cart.id} style={{ borderBottom: "1px solid #e8e4d8" }}>
                    <td style={{ padding: "16px", fontSize: 13, color: "#4a7c3f", verticalAlign: "top" }}>
                      <strong>{cart.user?.name}</strong><br/><small style={{ color: "#8a9c7a", fontSize: 11 }}>{cart.user?.email}</small>
                    </td>
                    <td style={{ padding: "16px", fontSize: 13, color: "#4a7c3f" }}>{cart.product?.name}</td>
                    <td style={{ padding: "16px", fontSize: 13, color: "#4a7c3f" }}>
                      <span style={{ padding: "4px 10px", background: "#fefce8", borderRadius: 30, fontSize: 11, color: "#d4a84a" }}>
                        {cart.product?.platform === "android" && "📱 Android"}
                        {cart.product?.platform === "game" && "🎮 Game"}
                        {cart.product?.platform === "windows" && "💻 Windows"}
                        {cart.product?.platform === "ios" && "📱 iOS"}
                      </span>
                    </td>
                    <td style={{ padding: "16px", fontSize: 13, color: "#4a7c3f" }}>{cart.quantity || 1}x</td>
                    <td style={{ padding: "16px", fontSize: 13, color: "#4a7c3f" }}>Rp {cart.product?.price?.toLocaleString()}</td>
                    <td style={{ padding: "16px", fontSize: 13, color: "#4a7c3f" }}>
                      <span style={{ fontWeight: 600, color: "#d4a84a" }}>Rp {(cart.product?.price * (cart.quantity || 1)).toLocaleString()}</span>
                    </td>
                    <td style={{ padding: "16px", fontSize: 13, color: "#4a7c3f" }}>
                      <span style={{ fontSize: 11, color: "#8a9c7a" }}>{new Date(cart.created_at).toLocaleDateString("id-ID")}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {carts.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            <div style={{ background: "white", borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 16, border: "1px solid #e8e4d8" }}>
              <span style={{ fontSize: 32 }}>🛒</span>
              <div>
                <div style={{ fontSize: 20, fontWeight: "bold", color: "#d4a84a" }}>{carts.length}</div>
                <div style={{ fontSize: 12, color: "#8a9c7a", marginTop: 4 }}>Total Item Keranjang</div>
              </div>
            </div>
            <div style={{ background: "white", borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 16, border: "1px solid #e8e4d8" }}>
              <span style={{ fontSize: 32 }}>👥</span>
              <div>
                <div style={{ fontSize: 20, fontWeight: "bold", color: "#d4a84a" }}>{new Set(carts.map(c => c.user?.id)).size}</div>
                <div style={{ fontSize: 12, color: "#8a9c7a", marginTop: 4 }}>User Aktif</div>
              </div>
            </div>
            <div style={{ background: "white", borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 16, border: "1px solid #e8e4d8" }}>
              <span style={{ fontSize: 32 }}>💰</span>
              <div>
                <div style={{ fontSize: 20, fontWeight: "bold", color: "#d4a84a" }}>Rp {carts.reduce((sum, c) => sum + (c.product?.price * (c.quantity || 1)), 0).toLocaleString()}</div>
                <div style={{ fontSize: 12, color: "#8a9c7a", marginTop: 4 }}>Total Nilai</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}