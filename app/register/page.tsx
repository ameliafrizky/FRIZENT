"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Gagal register");
      setLoading(false);
      return;
    }

    // ✅ REGISTER SUKSES → LANGSUNG KE HALAMAN LOGIN
    router.push("/login");
  };

  if (status === "loading") {
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
    <div className="container">
      <div className="card">
        <div className="logo">🎮 FRIZRENT</div>
        <h1>Daftar Akun</h1>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password (min 6)" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>{loading ? "Mendaftar..." : "Daftar"}</button>
        </form>
        <p>Sudah punya akun? <Link href="/login">Masuk</Link></p>
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fefce8;
          font-family: 'Inter', sans-serif;
        }
        .card {
          background: white;
          padding: 40px;
          border-radius: 24px;
          width: 100%;
          max-width: 400px;
          text-align: center;
          border: 1px solid #e8e4d8;
        }
        .logo {
          font-size: 24px;
          font-weight: 800;
          color: #d4a84a;
          margin-bottom: 24px;
        }
        h1 {
          font-size: 24px;
          color: #4a7c3f;
          margin-bottom: 24px;
        }
        input {
          width: 100%;
          padding: 12px;
          margin-bottom: 16px;
          border: 1px solid #e8e4d8;
          border-radius: 12px;
          font-size: 14px;
          box-sizing: border-box;
        }
        button {
          width: 100%;
          padding: 12px;
          background: #d4a84a;
          border: none;
          border-radius: 30px;
          font-size: 16px;
          font-weight: 600;
          color: white;
          cursor: pointer;
        }
        button:hover { background: #c4943a; }
        .error { color: #e8a0a0; margin-bottom: 16px; font-size: 14px; }
        p { margin-top: 20px; color: #8a9c7a; font-size: 14px; }
        a { color: #d4a84a; text-decoration: none; }
      `}</style>
    </div>
  );
}