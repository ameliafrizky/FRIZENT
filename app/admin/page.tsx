"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({ products: 0, rentals: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.replace("/login");
      return;
    }
    
    if (session.user?.role !== "admin") {
      router.replace("/dashboard-user");
      return;
    }
    
    setIsLoading(false);
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user?.role === "admin" && !isLoading) {
      Promise.all([
        fetch("/api/products").then(res => res.json()),
        fetch("/api/rentals").then(res => res.json()),
      ]).then(([products, rentals]) => {
        setStats({
          products: products.length || 0,
          rentals: rentals.length || 0,
          pending: rentals.filter((r: any) => r.status === "pending").length || 0,
        });
      }).catch(console.error);
    }
  }, [session, isLoading]);

  if (status === "loading" || isLoading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loader}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!session || session.user?.role !== "admin") return null;

  return (
    <div style={styles.dashboard}>
      <div style={styles.navbar}>
        <div style={styles.navContainer}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🎮</span>
            <span style={styles.logoText}>FRIZRENT ADMIN</span>
          </div>
          <div style={styles.navLinks}>
            <Link href="/admin" style={{...styles.navLink, ...styles.navLinkActive}}>Dashboard</Link>
            <Link href="/admin/produk" style={styles.navLink}>Produk</Link>
            <Link href="/admin/konfirmasi" style={styles.navLink}>Konfirmasi</Link>
            <Link href="/admin/carts" style={styles.navLink}>Cart User</Link>
            <button onClick={() => signOut({ callbackUrl: "/login" })} style={styles.logoutBtn}>Logout</button>
            <div style={styles.avatar}>{session.user?.name?.charAt(0).toUpperCase()}</div>
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>Selamat datang kembali, <span style={styles.adminName}>{session.user?.name}</span></h1>
          <p style={styles.welcomeDesc}>Kelola semua peminjaman game, produk, dan transaksi di sini.</p>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{...styles.statIconBox, background: "#fef3c7" }}><span style={{ fontSize: 28 }}>🎮</span></div>
            <div style={styles.statInfo}>
              <div style={styles.statValue}>{stats.products}</div>
              <div style={styles.statLabel}>Total Produk</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIconBox, background: "#fef3c7" }}><span style={{ fontSize: 28 }}>📋</span></div>
            <div style={styles.statInfo}>
              <div style={styles.statValue}>{stats.rentals}</div>
              <div style={styles.statLabel}>Total Peminjaman</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIconBox, background: "#fef3c7" }}><span style={{ fontSize: 28 }}>⏳</span></div>
            <div style={styles.statInfo}>
              <div style={styles.statValue}>{stats.pending}</div>
              <div style={styles.statLabel}>Menunggu Konfirmasi</div>
            </div>
          </div>
        </div>

        <div style={styles.menuSection}>
          <h2 style={styles.menuSectionTitle}>Menu Administrasi</h2>
          <div style={styles.menuGrid}>
            <Link href="/admin/produk" style={styles.menuCard}>
              <div style={{...styles.menuCardIcon, background: "#fef3c7", color: "#d97706" }}>🎮</div>
              <div style={styles.menuCardInfo}>
                <h3 style={styles.menuCardTitle}>Kelola Produk</h3>
                <p style={styles.menuCardDesc}>Tambah, edit, atau hapus produk game</p>
              </div>
              <div style={styles.menuCardArrow}>→</div>
            </Link>
            <Link href="/admin/konfirmasi" style={styles.menuCard}>
              <div style={{...styles.menuCardIcon, background: "#fef3c7", color: "#d97706" }}>✅</div>
              <div style={styles.menuCardInfo}>
                <h3 style={styles.menuCardTitle}>Konfirmasi Peminjaman</h3>
                <p style={styles.menuCardDesc}>Setujui atau tolak peminjaman</p>
              </div>
              <div style={styles.menuCardArrow}>→</div>
            </Link>
            <Link href="/admin/carts" style={styles.menuCard}>
              <div style={{...styles.menuCardIcon, background: "#fef3c7", color: "#d97706" }}>🛒</div>
              <div style={styles.menuCardInfo}>
                <h3 style={styles.menuCardTitle}>Keranjang User</h3>
                <p style={styles.menuCardDesc}>Lihat keranjang belanja user</p>
              </div>
              <div style={styles.menuCardArrow}>→</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  loadingWrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fffbeb" },
  loader: { width: 48, height: 48, border: "3px solid #fde68a", borderTopColor: "#f59e0b", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  dashboard: { minHeight: "100vh", background: "#fffbeb", fontFamily: "'Inter', sans-serif" },
  navbar: { background: "white", borderBottom: "1px solid #fde68a", padding: "12px 32px", position: "sticky" as const, top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(245, 158, 11, 0.1)" },
  navContainer: { maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" as const, gap: 16 },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { fontSize: 24 },
  logoText: { fontSize: 18, fontWeight: "bold", color: "#d97706" },
  navLinks: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" as const },
  navLink: { padding: "8px 20px", background: "#fffbeb", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#78350f", textDecoration: "none", transition: "0.2s" },
  navLinkActive: { background: "#f59e0b", color: "white" },
  logoutBtn: { padding: "8px 20px", background: "#ef4444", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "white", cursor: "pointer" },
  avatar: { width: 36, height: 36, background: "#f59e0b", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "white" },
  mainContent: { maxWidth: 1280, margin: "0 auto", padding: "40px 32px" },
  welcomeSection: { marginBottom: 40 },
  welcomeTitle: { fontSize: 24, fontWeight: 600, color: "#78350f", marginBottom: 8 },
  adminName: { color: "#f59e0b" },
  welcomeDesc: { fontSize: 14, color: "#92400e" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 48 },
  statCard: { background: "white", borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 16, boxShadow: "0 1px 3px rgba(245, 158, 11, 0.1)", border: "1px solid #fde68a" },
  statIconBox: { width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" },
  statInfo: { flex: 1 },
  statValue: { fontSize: 28, fontWeight: "bold", color: "#78350f" },
  statLabel: { fontSize: 13, color: "#92400e", marginTop: 4 },
  menuSection: { marginTop: 20 },
  menuSectionTitle: { fontSize: 18, fontWeight: 600, color: "#78350f", marginBottom: 20 },
  menuGrid: { display: "flex", flexDirection: "column" as const, gap: 16 },
  menuCard: { background: "white", borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 16, textDecoration: "none", border: "1px solid #fde68a", transition: "0.3s", cursor: "pointer" },
  menuCardIcon: { width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 },
  menuCardInfo: { flex: 1 },
  menuCardTitle: { fontSize: 16, fontWeight: 600, color: "#78350f", marginBottom: 4 },
  menuCardDesc: { fontSize: 13, color: "#92400e", margin: 0 },
  menuCardArrow: { fontSize: 20, color: "#fbbf24", transition: "0.3s" }
};