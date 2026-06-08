"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Rental {
  id: number;
  rent_date: string;
  expiry_date: string;
  is_active: boolean;
  status: string;
  user: { name: string; email: string };
  product: { name: string };
}

export default function AdminKonfirmasiPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchRentals();
  }, [session, status, router]);

  const fetchRentals = async () => {
    try {
      const res = await fetch("/api/admin/rentals");
      const data = await res.json();
      setRentals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: number) => {
    if (!confirm("Konfirmasi peminjaman ini?")) return;
    try {
      const res = await fetch(`/api/admin/rentals/${id}/confirm`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      
      if (res.ok) {
        alert("✅ Peminjaman berhasil dikonfirmasi!");
        fetchRentals();
      } else {
        alert("Gagal mengkonfirmasi");
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Tolak peminjaman ini?")) return;
    try {
      const res = await fetch(`/api/admin/rentals/${id}/confirm`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      
      if (res.ok) {
        alert("❌ Peminjaman ditolak!");
        fetchRentals();
      } else {
        alert("Gagal menolak");
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  const filteredByStatus = rentals.filter((r) => {
    if (filter === "pending") return r.status === "pending";
    if (filter === "active") return r.is_active === true;
    if (filter === "expired") return r.is_active === false && r.status !== "pending";
    return true;
  });

  const filteredRentals = filteredByStatus.filter((r) =>
    r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.product?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (status === "loading" || loading) {
    return (
      <div className="loadingWrap">
        <div className="loader"></div>
        <style jsx>{`
          .loadingWrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #fefce8; }
          .loader { width: 36px; height: 36px; border: 3px solid #e0dcd0; border-top-color: #d4a84a; border-radius: 50%; animation: spin 0.8s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
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
            <Link href="/admin/konfirmasi" style={navLinkActiveStyle}>Konfirmasi</Link>
            <Link href="/admin/carts" style={navLinkStyle}>Cart User</Link>
            <button onClick={() => router.push("/logout")} style={logoutBtnStyle}>Logout</button>
            <div style={avatarStyle}>{session.user?.name?.charAt(0).toUpperCase()}</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "#4a7c3f", margin: 0 }}>📋 Konfirmasi Peminjaman</h1>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="🔍 Cari user atau produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e8e4d8", background: "white", width: 220, outline: "none" }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setFilter("pending")} style={{ padding: "8px 20px", borderRadius: 30, border: "1px solid #e8e4d8", background: filter === "pending" ? "#d4a84a" : "white", color: filter === "pending" ? "white" : "#78350f", cursor: "pointer" }}>Menunggu</button>
              <button onClick={() => setFilter("active")} style={{ padding: "8px 20px", borderRadius: 30, border: "1px solid #e8e4d8", background: filter === "active" ? "#d4a84a" : "white", color: filter === "active" ? "white" : "#78350f", cursor: "pointer" }}>Aktif</button>
              <button onClick={() => setFilter("expired")} style={{ padding: "8px 20px", borderRadius: 30, border: "1px solid #e8e4d8", background: filter === "expired" ? "#d4a84a" : "white", color: filter === "expired" ? "white" : "#78350f", cursor: "pointer" }}>Kadaluarsa</button>
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto", background: "white", borderRadius: 16, border: "1px solid #e8e4d8" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ background: "#fefce8", borderBottom: "1px solid #e8e4d8" }}>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#4a7c3f" }}>User</th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#4a7c3f" }}>Produk</th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#4a7c3f" }}>Tgl Sewa</th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#4a7c3f" }}>Expired</th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#4a7c3f" }}>Status</th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#4a7c3f" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRentals.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 48, color: "#8a9c7a" }}>Tidak ada data</td>
                </tr>
              ) : (
                filteredRentals.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #e8e4d8" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <strong style={{ color: "#4a7c3f" }}>{r.user?.name}</strong><br/><small style={{ color: "#8a9c7a", fontSize: 11 }}>{r.user?.email}</small>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#4a7c3f" }}>{r.product?.name}</td>
                    <td style={{ padding: "14px 16px", color: "#4a7c3f" }}>{new Date(r.rent_date).toLocaleDateString("id-ID")}</td>
                    <td style={{ padding: "14px 16px", color: "#4a7c3f" }}>{r.expiry_date ? new Date(r.expiry_date).toLocaleDateString("id-ID") : "-"}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        background: r.is_active ? "#dcfce7" : r.status === "pending" ? "#fef3c7" : "#fee2e2",
                        color: r.is_active ? "#166534" : r.status === "pending" ? "#92400e" : "#991b1b",
                      }}>
                        {r.is_active ? "Aktif" : r.status === "pending" ? "Menunggu" : "Kadaluarsa"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {r.status === "pending" && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => handleConfirm(r.id)} style={{ padding: "5px 14px", background: "#d4a84a", border: "none", borderRadius: 20, cursor: "pointer", color: "white" }}>✓ Setuju</button>
                          <button onClick={() => handleReject(r.id)} style={{ padding: "5px 14px", background: "#e8a0a0", border: "none", borderRadius: 20, cursor: "pointer", color: "white" }}>✗ Tolak</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}