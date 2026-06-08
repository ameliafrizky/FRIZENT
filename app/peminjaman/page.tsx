"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Rental {
  id: number;
  rent_date: string;
  expiry_date: string;
  is_active: boolean;
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    download_link: string;
    platform: string;
    image_url: string;
  };
}

export default function PeminjamanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchRentals();
    }
  }, [status, router]);

  const fetchRentals = async () => {
    try {
      const res = await fetch("/api/rentals");
      const data = await res.json();
      if (Array.isArray(data)) setRentals(data);
      else setRentals([]);
    } catch (error) {
      console.error(error);
      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysLeft = (expiryDate: string) => {
    const diff = new Date(expiryDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const isExpired = (expiryDate: string) => new Date(expiryDate) < new Date();

  if (status === "loading" || loading) {
    return (
      <div className="loadingWrap">
        <div className="loader"></div>
        <style jsx>{`
          .loadingWrap {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fefce8;
          }
          .loader {
            width: 36px;
            height: 36px;
            border: 3px solid #e0dcd0;
            border-top-color: #d4a84a;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const activeRentals = rentals.filter(r => r.is_active && !isExpired(r.expiry_date));
  const expiredRentals = rentals.filter(r => !r.is_active || isExpired(r.expiry_date));

  return (
    <div className="peminjamanPage">
      <nav className="navbar">
        <div className="navContainer">
          <div className="logo" onClick={() => router.push("/")}>
            <span className="logoIcon">🎮</span>
            <span className="logoText">FRIZRENT</span>
          </div>
          <div className="navLinks">
            <button onClick={() => router.push("/")} className="navLink">Beranda</button>
            <button onClick={() => router.push("/cart")} className="navLink">Keranjang</button>
            <button onClick={() => router.push("/peminjaman")} className="navLink aktif">Peminjaman</button>
            <button onClick={() => router.push("/logout")} className="logoutBtn">Logout</button>
            <div className="avatar">{session?.user?.name?.charAt(0).toUpperCase()}</div>
          </div>
        </div>
      </nav>

      <div className="main">
        <div className="peminjamanContainer">
          <div className="headerSection">
            <h1 className="pageTitle">📋 Peminjamanku</h1>
            <p className="pageSubtitle">Kelola semua peminjaman game & aplikasi kamu</p>
          </div>

          {rentals.length === 0 ? (
            <div className="emptyState">
              <div className="emptyIcon">🎮</div>
              <h3>Belum Ada Peminjaman</h3>
              <p>Sewa game atau aplikasi favoritmu sekarang!</p>
              <button onClick={() => router.push("/")} className="sekarangBtn">Mulai Belanja</button>
            </div>
          ) : (
            <>
              {activeRentals.length > 0 && (
                <div className="section">
                  <div className="sectionHeader">
                    <span className="sectionIcon">✅</span>
                    <h2 className="sectionTitle">Sedang Aktif</h2>
                    <span className="badge aktif">{activeRentals.length} aktif</span>
                  </div>
                  <div className="rentalGrid">
                    {activeRentals.map((rental) => (
                      <div key={rental.id} className="rentalCard aktifCard">
                        <div className="cardImage">
                          {rental.product.image_url ? (
                            <img src={rental.product.image_url} alt={rental.product.name} />
                          ) : (
                            <span className="cardEmoji">🎮</span>
                          )}
                        </div>
                        <div className="cardBody">
                          <h3 className="rentalTitle">{rental.product.name}</h3>
                          <p className="rentalDesc">{rental.product.description || "Game seru untuk dimainkan"}</p>
                          <div className="rentalDates">
                            <span>📅 Sewa: {new Date(rental.rent_date).toLocaleDateString('id-ID')}</span>
                            <span>⏰ Expired: {new Date(rental.expiry_date).toLocaleDateString('id-ID')}</span>
                          </div>
                          <div className="progressSection">
                            <div className="progressBar">
                              <div className="progressFill" style={{ width: `${Math.min(100, (getDaysLeft(rental.expiry_date) / 30) * 100)}%` }}></div>
                            </div>
                            <span className="daysLeft">Sisa {getDaysLeft(rental.expiry_date)} hari</span>
                          </div>
                          {rental.product.download_link && (
                            <a href={rental.product.download_link} target="_blank" className="downloadBtn">⬇️ Download</a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expiredRentals.length > 0 && (
                <div className="section">
                  <div className="sectionHeader">
                    <span className="sectionIcon">⏰</span>
                    <h2 className="sectionTitle">Kadaluarsa</h2>
                    <span className="badge expired">{expiredRentals.length} expired</span>
                  </div>
                  <div className="rentalGrid">
                    {expiredRentals.map((rental) => (
                      <div key={rental.id} className="rentalCard expiredCard">
                        <div className="cardImage expiredImage">
                          {rental.product.image_url ? (
                            <img src={rental.product.image_url} alt={rental.product.name} />
                          ) : (
                            <span className="cardEmoji">🎮</span>
                          )}
                        </div>
                        <div className="cardBody">
                          <h3 className="rentalTitle">{rental.product.name}</h3>
                          <p className="rentalDesc">{rental.product.description || "Game seru untuk dimainkan"}</p>
                          <div className="rentalDates">
                            <span>📅 Sewa: {new Date(rental.rent_date).toLocaleDateString('id-ID')}</span>
                            <span>⏰ Expired: {new Date(rental.expiry_date).toLocaleDateString('id-ID')}</span>
                          </div>
                          <button onClick={() => router.push("/")} className="sewaLagiBtn">Sewa Lagi →</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .peminjamanPage {
          min-height: 100vh;
          background: #fefce8;
          font-family: 'Inter', sans-serif;
        }
        .navbar {
          background: white;
          border-bottom: 1px solid #e8e4d8;
          padding: 16px 32px;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .navContainer {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        .logoIcon { font-size: 28px; }
        .logoText {
          font-size: 22px;
          font-weight: 800;
          color: #d4a84a;
        }
        .navLinks {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }
        .navLink {
          padding: 10px 24px;
          background: transparent;
          border: none;
          border-radius: 40px;
          font-size: 14px;
          font-weight: 600;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .navLink:hover { background: #fefce8; }
        .navLink.aktif {
          background: #d4a84a;
          color: white;
        }
        .logoutBtn {
          padding: 10px 24px;
          background: #e8a0a0;
          border: none;
          border-radius: 40px;
          font-size: 14px;
          font-weight: 600;
          color: white;
          cursor: pointer;
        }
        .logoutBtn:hover { background: #d49090; }
        .avatar {
          width: 42px;
          height: 42px;
          background: #d4a84a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
        }
        .main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 24px;
        }
        .peminjamanContainer {
          background: white;
          border-radius: 32px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid #e8e4d8;
        }
        .headerSection { text-align: center; margin-bottom: 40px; }
        .pageTitle { font-size: 28px; font-weight: 700; color: #4a7c3f; margin-bottom: 8px; }
        .pageSubtitle { color: #8a9c7a; font-size: 14px; }
        .emptyState { text-align: center; padding: 60px 20px; }
        .emptyIcon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
        .emptyState h3 { font-size: 20px; color: #4a7c3f; margin-bottom: 8px; }
        .emptyState p { color: #8a9c7a; margin-bottom: 24px; }
        .sekarangBtn {
          padding: 12px 32px;
          background: #d4a84a;
          border: none;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }
        .sekarangBtn:hover { background: #c4943a; }
        .section { margin-bottom: 40px; }
        .sectionHeader {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e8e4d8;
        }
        .sectionIcon { font-size: 20px; }
        .sectionTitle { font-size: 18px; font-weight: 600; color: #4a7c3f; }
        .badge { padding: 4px 12px; border-radius: 30px; font-size: 11px; font-weight: 600; }
        .badge.aktif { background: #dcfce7; color: #166534; }
        .badge.expired { background: #fee2e2; color: #991b1b; }
        .rentalGrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }
        .rentalCard {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid #e8e4d8;
          transition: all 0.3s ease;
        }
        .rentalCard:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1); }
        .aktifCard { border-left: 4px solid #4a7c3f; }
        .expiredCard { opacity: 0.8; border-left: 4px solid #e8a0a0; }
        .cardImage {
          height: 140px;
          background: #fefce8;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cardImage img { width: 100%; height: 100%; object-fit: cover; }
        .expiredImage { filter: grayscale(0.3); }
        .cardEmoji { font-size: 56px; }
        .cardBody { padding: 20px; }
        .rentalTitle { font-size: 16px; font-weight: 700; color: #4a7c3f; margin-bottom: 6px; }
        .rentalDesc { font-size: 12px; color: #8a9c7a; margin-bottom: 12px; }
        .rentalDates { display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #8a9c7a; margin-bottom: 12px; }
        .progressSection { margin-bottom: 16px; }
        .progressBar { height: 4px; background: #e8e4d8; border-radius: 4px; overflow: hidden; margin-bottom: 6px; }
        .progressFill { height: 100%; background: #d4a84a; border-radius: 4px; }
        .daysLeft { font-size: 11px; color: #d4a84a; font-weight: 500; }
        .downloadBtn {
          display: block;
          text-align: center;
          padding: 10px;
          background: #d4a84a;
          color: white;
          text-decoration: none;
          border-radius: 40px;
          font-size: 13px;
          font-weight: 600;
        }
        .downloadBtn:hover { background: #c4943a; }
        .sewaLagiBtn {
          width: 100%;
          padding: 10px;
          background: #fefce8;
          border: 1px solid #d4a84a;
          border-radius: 40px;
          font-size: 13px;
          font-weight: 600;
          color: #d4a84a;
          cursor: pointer;
        }
        .sewaLagiBtn:hover { background: #d4a84a; color: white; }
        @media (max-width: 768px) {
          .navContainer { flex-direction: column; }
          .main { padding: 24px 16px; }
          .peminjamanContainer { padding: 20px; }
          .rentalGrid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}