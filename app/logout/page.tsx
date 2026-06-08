"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <div className="container">
      <div className="card">
        <div className="logo">🚪 FRIZRENT</div>
        <h1>Yakin ingin logout?</h1>
        <p>Kamu akan keluar dari akun FRIZRENT</p>
        
        <div className="buttons">
          <button onClick={handleLogout} className="btnLogout">
            Ya, Logout
          </button>
          <button onClick={() => router.back()} className="btnCancel">
            Batal
          </button>
        </div>
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
          padding: 48px 40px;
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
          margin-bottom: 12px;
        }
        p {
          font-size: 14px;
          color: #8a9c7a;
          margin-bottom: 32px;
        }
        .buttons {
          display: flex;
          gap: 16px;
        }
        .btnLogout {
          flex: 1;
          padding: 12px;
          background: #e8a0a0;
          border: none;
          border-radius: 30px;
          font-size: 16px;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btnLogout:hover {
          background: #d49090;
        }
        .btnCancel {
          flex: 1;
          padding: 12px;
          background: #d4a84a;
          border: none;
          border-radius: 30px;
          font-size: 16px;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btnCancel:hover {
          background: #c4943a;
        }
      `}</style>
    </div>
  );
}