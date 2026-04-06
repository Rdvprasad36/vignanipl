"use client";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserDoc } from "@/lib/firestore";

export default function AdminRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teamName, setTeamName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const registerNewAdmin = async () => {
    if (!email || !password || !teamName) {
      setStatus("❌ Please fill all fields.");
      return;
    }
    if (password.length < 6) {
      setStatus("❌ Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setStatus("Creating new admin account...");

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await createUserDoc(cred.user.uid, teamName, "admin");
      setStatus(`✅ New admin created! Email: ${email} | Password: ${password} | Team: ${teamName}`);
      setDone(true);
    } catch (e) {
      if (e.code === "auth/email-already-in-use") {
        setStatus(`ℹ️ Email ${email} already in use. Try logging in.`);
      } else {
        setStatus("❌ Error: " + e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 20px" }}>
      <div className="card" style={{ maxWidth: 480, width: "100%", padding: "40px 32px", textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>👑</div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 8 }}>Register Additional Admin</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: "0.9rem" }}>
          Create additional admin accounts anytime.
        </p>
        {!done ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "left" }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.88rem", fontWeight: 600, color: "var(--text-secondary)" }}>📧 Admin Email</label>
              <input
                type="email"
                className="input"
                placeholder="newadmin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.88rem", fontWeight: 600, color: "var(--text-secondary)" }}>🏷️ Team Name</label>
              <input
                type="text"
                className="input"
                placeholder="New Admin Team"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.88rem", fontWeight: 600, color: "var(--text-secondary)" }}>🔑 Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={registerNewAdmin}
              disabled={loading}
              style={{ width: "100%", padding: "13px", fontSize: "0.95rem" }}
            >
              {loading ? "Creating..." : "🚀 Create New Admin Account"}
            </button>
          </div>
        ) : (
          <>
            <div style={{ background: "#dcfce7", border: "1px solid #16a34a", borderRadius: 8, padding: "20px", marginBottom: 20, fontSize: "0.95rem", color: "#166534" }}>
              {status}
              <br/><br/>
              <strong>💡 Save these credentials securely!</strong>
            </div>
            <a href="/login?admin=true" className="btn btn-gold" style={{ display: "block", width: "100%", padding: "13px", fontSize: "0.95rem", textAlign: "center" }}>
              🔐 Login as Admin
            </a>
          </>
        )}
        {status && !done && (
          <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 8, padding: "12px", marginTop: 16, fontSize: "0.88rem", color: "#92400e" }}>
            {status}
          </div>
        )}
        <div style={{ marginTop: 24, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          First admin setup: <a href="/setup-admin" style={{ color: "var(--vignan-blue)", fontWeight: 600 }}>Setup Admin →</a>
        </div>
      </div>
    </div>
  );
}
