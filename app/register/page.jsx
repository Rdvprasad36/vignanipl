'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserDoc } from "@/lib/firestore";

export default function Register() {
  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
  const [tier, setTier] = useState('medium');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
await createUserDoc(userCredential.user.uid, teamName.trim(), "team", leaderName.trim(), tier);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      padding: '40px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        width: '100%',
        backgroundColor: '#ffffff',
        padding: '48px 40px',
        border: '1px solid #e2e8f0',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0,0,0.25)'
      }}>
        {/* Intro Section - Blue */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          color: 'white',
          padding: '40px',
          borderRadius: '20px',
          textAlign: 'center',
          marginBottom: '32px',
          boxShadow: '0 10px 15px -3px rgba(0, 0,0,0.1)'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            margin: '0 0 12px 0',
            letterSpacing: '-0.025em'
          }}>
            Build Your Identity
          </h1>
          <p style={{
            fontSize: '20px',
            lineHeight: '1.6',
            margin: 0,
            opacity: 0.95
          }}>
            Create your team profile to participate in the biggest college auction event.
          </p>
        </div>

        {/* Team Identity Section */}
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          padding: '40px',
          borderRadius: '20px',
          border: '1px solid #bfdbfe'
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1e40af',
            margin: '0 0 40px 0',
            textAlign: 'center',
            paddingBottom: '16px',
            borderBottom: '4px solid #3b82f6',
            letterSpacing: '-0.025em'
          }}>
            Team Identity
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Team Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#111827',
                  letterSpacing: '-0.025em',
                  lineHeight: '1.3'
                }}>
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Cool Team Name..."
                  required
                  disabled={loading}
                  style={{
                    height: '80px',
                    padding: '24px 28px',
                    border: '2px solid #d1d5db',
                    borderRadius: '20px',
                    fontSize: '20px',
                    fontWeight: '500',
                    backgroundColor: '#fafbfc',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.backgroundColor = '#fafbfc';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </div>

              {/* Team Leader */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#111827',
                  letterSpacing: '-0.025em',
                  lineHeight: '1.3'
                }}>
                  Team Leader
                </label>
                <input
                  type="text"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  placeholder="Full Name"
                  required
                  disabled={loading}
                  style={{
                    height: '80px',
                    padding: '24px 28px',
                    border: '2px solid #d1d5db',
                    borderRadius: '20px',
                    fontSize: '20px',
                    fontWeight: '500',
                    backgroundColor: '#fafbfc',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.backgroundColor = '#fafbfc';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </div>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#111827',
                  letterSpacing: '-0.025em',
                  lineHeight: '1.3'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="testadmin@gmail.com"
                  required
                  disabled={loading}
                  style={{
                    height: '80px',
                    padding: '24px 28px',
                    border: '2px solid #d1d5db',
                    borderRadius: '20px',
                    fontSize: '20px',
                    fontWeight: '500',
                    backgroundColor: '#fafbfc',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.backgroundColor = '#fafbfc';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#111827',
                  letterSpacing: '-0.025em',
                  lineHeight: '1.3'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••••"
                  required
                  disabled={loading}
                  style={{
                    height: '80px',
                    padding: '24px 28px',
                    border: '2px solid #d1d5db',
                    borderRadius: '20px',
                    fontSize: '20px',
                    fontWeight: '500',
                    backgroundColor: '#fafbfc',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.backgroundColor = '#fafbfc';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#111827',
                letterSpacing: '-0.025em',
                lineHeight: '1.3'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                style={{
                  height: '80px',
                  padding: '24px 28px',
                  border: '2px solid #d1d5db',
                  borderRadius: '20px',
                  fontSize: '20px',
                  fontWeight: '500',
                  backgroundColor: '#fafbfc',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.backgroundColor = '#fafbfc';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
            </div>

            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                padding: '20px',
                border: '1px solid #fecaca',
                borderRadius: '16px',
                fontSize: '18px',
                fontWeight: '500'
              }}>
                {error}
              </div>
            )}

            {/* Two Buttons Side by Side */}
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button 
                type="button"
                onClick={handleCancel}
                disabled={loading}
                style={{
                  flex: 1,
                  maxWidth: '300px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0',
                  borderRadius: '20px',
                  fontSize: '20px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 10px 15px -3px rgba(75, 85, 99, 0.4)',
                  letterSpacing: '-0.025em'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.background = 'linear-gradient(135deg, #4b5563 0%, #374151 100%)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 20px 25px -5px rgba(75, 85, 99, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.background = 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 10px 15px -3px rgba(75, 85, 99, 0.4)';
                  }
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  flex: 1,
                  maxWidth: '300px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0',
                  borderRadius: '20px',
                  fontSize: '20px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)',
                  letterSpacing: '-0.025em'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.4)';
                  }
                }}
              >
                {loading ? "Creating Team..." : "REGISTER TEAM & START"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

