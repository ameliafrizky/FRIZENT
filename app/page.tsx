"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  platform: string;
  download_link: string;
  image_url?: string;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const defaultProducts: Product[] = [
    {
      id: 1,
      name: "Game Portal Jungle",
      description: "Game platform mengambil koin",
      price: 5000,
      platform: "game",
      download_link: "#"
    },
    {
      id: 2,
      name: "Game Store",
      description: "Aplikasi game store seperti playstore",
      price: 5000,
      platform: "game",
      download_link: "#"
    }
  ];

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setProducts(data);
        else setProducts(defaultProducts);
      })
      .catch(() => setProducts(defaultProducts))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = async (product: Product) => {
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      if (res.ok) {
        alert(`✅ ${product.name} ditambahkan ke keranjang!`);
      } else {
        const data = await res.json();
        alert(`❌ ${data.error || "Gagal menambahkan"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menambahkan ke keranjang");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
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

  return (
    <div className="homepage">
      <nav className="navbar">
        <div className="navContainer">
          <div className="logo" onClick={() => router.push("/")}>
            <span className="logoIcon">🎮</span>
            <span className="logoText">FRIZRENT</span>
          </div>
          
          <div className="navLinks">
            <button onClick={() => router.push("/")} className="navLink aktif">Beranda</button>
            <button onClick={() => router.push("/cart")} className="navLink">Keranjang</button>
            <button onClick={() => router.push("/peminjaman")} className="navLink">Peminjaman</button>
            {session ? (
              <>
                <button onClick={() => router.push("/logout")} className="logoutBtn">Logout</button>
                <div className="avatar">{session.user?.name?.charAt(0).toUpperCase()}</div>
              </>
            ) : (
              <button onClick={() => router.push("/login")} className="loginBtn">Login</button>
            )}
          </div>
        </div>
      </nav>

      <div className="hero">
        <h1 className="heroTitle">Sewa Game & Aplikasi</h1>
        <p className="heroSubtitle">
          Premium favoritmu dengan harga terjangkau. Sewa harian, download langsung!
        </p>
        <button 
          onClick={() => document.getElementById("koleksi")?.scrollIntoView({ behavior: "smooth" })}
          className="heroBtn"
        >
          Lihat Koleksi →
        </button>
      </div>

      <div className="searchSection">
        <div className="searchContainer">
          <span className="searchIcon">🔍</span>
          <input
            type="text"
            placeholder="Cari game atau aplikasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="searchInput"
          />
        </div>
      </div>

      <div id="koleksi" className="productsSection">
        <div className="productsGrid">
          {(search ? filteredProducts : products).map((product) => (
            <div key={product.id} className="productCard">
              <div className="cardImage">
                <span className="cardEmoji">🎮</span>
              </div>
              <div className="cardBody">
                <h3 className="productTitle">{product.name}</h3>
                <p className="productDesc">{product.description}</p>
                <div className="productFooter">
                  <span className="productPrice">
                    Rp {product.price.toLocaleString()} <span className="priceUnit">/hari</span>
                  </span>
                  <button onClick={() => addToCart(product)} className="sewaBtn">Sewa</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .homepage {
          min-height: 100vh;
          background: #fefce8;
          font-family: 'Inter', sans-serif;
        }
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
        .navbar {
          background: white;
          border-bottom: 1px solid #e8e4d8;
          padding: 16px 32px;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .navContainer {
          max-width: 1200px;
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
          gap: 8px;
          cursor: pointer;
        }
        .logoIcon { font-size: 24px; }
        .logoText { font-size: 20px; font-weight: 800; color: #d4a84a; }
        .navLinks {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }
        .navLink {
          padding: 8px 20px;
          background: transparent;
          border: none;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 600;
          color: #4a5568;
          cursor: pointer;
        }
        .navLink:hover { background: #f0f2f5; }
        .navLink.aktif {
          background: #d4a84a;
          color: white;
        }
        .logoutBtn {
          padding: 8px 20px;
          background: #e8a0a0;
          border: none;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 600;
          color: white;
          cursor: pointer;
        }
        .loginBtn {
          padding: 8px 20px;
          background: #d4a84a;
          border: none;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 600;
          color: white;
          cursor: pointer;
        }
        .avatar {
          width: 36px;
          height: 36px;
          background: #d4a84a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
        }
        .hero {
          background: linear-gradient(135deg, #d4a84a 0%, #c4943a 100%);
          margin: 32px 32px 0 32px;
          border-radius: 32px;
          padding: 60px 40px;
          text-align: center;
          color: white;
        }
        .heroTitle {
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 16px;
        }
        .heroSubtitle {
          font-size: 18px;
          opacity: 0.95;
          margin-bottom: 32px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        .heroBtn {
          padding: 14px 36px;
          background: white;
          border: none;
          border-radius: 60px;
          font-size: 16px;
          font-weight: 700;
          color: #d4a84a;
          cursor: pointer;
        }
        .searchSection {
          padding: 32px 32px 0 32px;
        }
        .searchContainer {
          max-width: 500px;
          margin: 0 auto;
          position: relative;
        }
        .searchIcon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
          color: #a0aec0;
        }
        .searchInput {
          width: 100%;
          padding: 16px 20px 16px 50px;
          border: 1px solid #e8e4d8;
          border-radius: 60px;
          font-size: 15px;
          background: white;
          outline: none;
        }
        .searchInput:focus {
          border-color: #d4a84a;
          box-shadow: 0 0 0 3px rgba(212, 168, 74, 0.1);
        }
        .productsSection {
          padding: 40px 32px 60px 32px;
        }
        .productsGrid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 28px;
        }
        .productCard {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #e8e4d8;
        }
        .productCard:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.15);
        }
        .cardImage {
          height: 160px;
          background: #fefce8;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cardEmoji { font-size: 64px; }
        .cardBody { padding: 20px; }
        .productTitle {
          font-size: 18px;
          font-weight: 700;
          color: #4a7c3f;
          margin-bottom: 8px;
        }
        .productDesc {
          font-size: 13px;
          color: #8a9c7a;
          line-height: 1.5;
          margin-bottom: 16px;
        }
        .productFooter {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
        }
        .productPrice {
          font-size: 18px;
          font-weight: 800;
          color: #d4a84a;
        }
        .priceUnit {
          font-size: 11px;
          font-weight: 400;
          color: #a0aec0;
        }
        .sewaBtn {
          padding: 8px 24px;
          background: #d4a84a;
          border: none;
          border-radius: 40px;
          font-size: 13px;
          font-weight: 600;
          color: white;
          cursor: pointer;
        }
        .sewaBtn:hover {
          background: #c4943a;
          transform: scale(1.02);
        }
        @media (max-width: 768px) {
          .navContainer { flex-direction: column; }
          .hero { margin: 16px; padding: 40px 20px; border-radius: 32px; }
          .heroTitle { font-size: 28px; }
          .heroSubtitle { font-size: 14px; }
          .productsGrid { grid-template-columns: 1fr; }
          .searchSection { padding: 32px 20px 0 20px; }
          .productsSection { padding: 40px 20px 60px 20px; }
        }
      `}</style>
    </div>
  );
}