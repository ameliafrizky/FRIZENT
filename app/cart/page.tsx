"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface CartItemWithId extends Product {
  cartId: number;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<CartItemWithId[]>([]);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchCart();
    }
  }, [status, router]);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      
      const cartItems = data.map((item: any) => ({
        id: item.product.id,
        name: item.product.name,
        description: item.product.description,
        price: item.product.price,
        image_url: item.product.image_url,
        cartId: item.id,
        quantity: item.quantity,
      }));
      
      setCart(cartItems);
    } catch (error) {
      console.error(error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartId: number) => {
    try {
      const res = await fetch(`/api/cart?id=${cartId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCart(cart.filter((item) => item.cartId !== cartId));
        alert("✅ Produk dihapus dari keranjang!");
      } else {
        alert("Gagal menghapus");
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          products: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })), 
          total: totalPrice 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Checkout berhasil!");
        for (const item of cart) {
          await fetch(`/api/cart?id=${item.cartId}`, { method: "DELETE" });
        }
        setCart([]);
        router.push("/peminjaman");
      } else {
        alert(`❌ ${data.error || "Checkout gagal!"}`);
      }
    } catch (error) {
      alert("Terjadi kesalahan saat checkout");
    } finally {
      setProcessing(false);
    }
  };

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

  return (
    <div className="cartPage">
      <nav className="navbar">
        <div className="navContainer">
          <div className="logo" onClick={() => router.push("/")}>
            <span className="logoIcon">🎮</span>
            <span className="logoText">FRIZRENT</span>
          </div>
          <div className="navLinks">
            <button onClick={() => router.push("/")} className="navLink">Beranda</button>
            <button onClick={() => router.push("/cart")} className="navLink aktif">Keranjang</button>
            <button onClick={() => router.push("/peminjaman")} className="navLink">Peminjaman</button>
            <button onClick={() => router.push("/logout")} className="logoutBtn">Logout</button>
            <div className="avatar">{session?.user?.name?.charAt(0).toUpperCase()}</div>
          </div>
        </div>
      </nav>

      <div className="main">
        <div className="cartContainer">
          <div className="cartHeader">
            <h1 className="cartTitle">🛒 Keranjang Belanja</h1>
            <p className="cartCount">{cart.length} produk</p>
          </div>

          {cart.length === 0 ? (
            <div className="emptyCart">
              <div className="emptyIcon">🛍️</div>
              <h3>Keranjang kosong</h3>
              <p>Belum ada produk nih</p>
              <button onClick={() => router.push("/")} className="belanjaBtn">Mulai Belanja</button>
            </div>
          ) : (
            <>
              <div className="cartItems">
                {cart.map((item) => (
                  <div key={item.cartId} className="cartItem">
                    <div className="itemImage">
                      {item.image_url ? <img src={item.image_url} alt={item.name} /> : <span>🎮</span>}
                    </div>
                    <div className="itemInfo">
                      <h3 className="itemName">{item.name}</h3>
                      <p className="itemDesc">{item.description || "Game seru untuk dimainkan"}</p>
                      <div className="itemPrice">
                        Rp {item.price.toLocaleString()} <span className="priceUnit">/hari</span>
                        {item.quantity > 1 && <span className="quantityBadge"> x{item.quantity}</span>}
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.cartId)} className="removeBtn">Hapus</button>
                  </div>
                ))}
              </div>

              <div className="cartFooter">
                <div className="totalSection">
                  <span className="totalLabel">Total</span>
                  <span className="totalPrice">Rp {totalPrice.toLocaleString()}</span>
                </div>
                <button onClick={handleCheckout} disabled={processing} className="checkoutBtn">
                  {processing ? "Memproses..." : "Checkout →"}
                </button>
                <p className="checkoutNote">Dengan checkout, kamu menyetujui syarat & ketentuan</p>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .cartPage {
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
          max-width: 900px;
          margin: 0 auto;
          padding: 48px 24px;
        }
        .cartContainer {
          background: white;
          border-radius: 32px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid #e8e4d8;
        }
        .cartHeader {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 28px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f0f2f5;
        }
        .cartTitle { font-size: 24px; font-weight: 700; color: #4a7c3f; }
        .cartCount { color: #8a9c7a; font-size: 14px; }
        .emptyCart { text-align: center; padding: 60px 20px; }
        .emptyIcon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
        .emptyCart h3 { font-size: 20px; color: #4a7c3f; margin-bottom: 8px; }
        .emptyCart p { color: #8a9c7a; margin-bottom: 24px; }
        .belanjaBtn {
          padding: 12px 32px;
          background: #d4a84a;
          border: none;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }
        .belanjaBtn:hover { background: #c4943a; }
        .cartItems { margin-bottom: 24px; max-height: 500px; overflow-y: auto; }
        .cartItem {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #fefce8;
          border-radius: 20px;
          margin-bottom: 12px;
          border: 1px solid #e8e4d8;
        }
        .itemImage {
          width: 60px;
          height: 60px;
          background: #fefce8;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }
        .itemImage img { width: 100%; height: 100%; object-fit: cover; border-radius: 16px; }
        .itemInfo { flex: 1; }
        .itemName { font-size: 15px; font-weight: 700; color: #4a7c3f; margin-bottom: 4px; }
        .itemDesc { font-size: 12px; color: #8a9c7a; margin-bottom: 6px; }
        .itemPrice { font-size: 14px; font-weight: 700; color: #d4a84a; }
        .priceUnit { font-size: 10px; font-weight: 400; color: #8a9c7a; }
        .quantityBadge { font-size: 11px; background: #d4a84a; color: white; padding: 2px 6px; border-radius: 20px; margin-left: 8px; }
        .removeBtn {
          padding: 6px 16px;
          background: #fff5f5;
          border: none;
          border-radius: 30px;
          color: #e8a0a0;
          font-size: 12px;
          cursor: pointer;
        }
        .removeBtn:hover { background: #ffe0e0; }
        .cartFooter {
          border-top: 2px solid #e8e4d8;
          padding-top: 24px;
        }
        .totalSection {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 20px;
        }
        .totalLabel { font-size: 16px; color: #8a9c7a; }
        .totalPrice { font-size: 28px; font-weight: 800; color: #d4a84a; }
        .checkoutBtn {
          width: 100%;
          padding: 14px;
          background: #d4a84a;
          border: none;
          border-radius: 60px;
          font-size: 16px;
          font-weight: 600;
          color: white;
          cursor: pointer;
        }
        .checkoutBtn:hover { background: #c4943a; }
        .checkoutBtn:disabled { background: #e8e4d8; cursor: not-allowed; }
        .checkoutNote {
          text-align: center;
          font-size: 11px;
          color: #8a9c7a;
          margin-top: 12px;
        }
        @media (max-width: 768px) {
          .navContainer { flex-direction: column; }
          .main { padding: 24px 16px; }
          .cartContainer { padding: 20px; }
          .cartItem { flex-wrap: wrap; }
          .removeBtn { width: 100%; margin-top: 8px; }
        }
      `}</style>
    </div>
  );
}