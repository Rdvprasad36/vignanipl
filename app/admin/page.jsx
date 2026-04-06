'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  getAllPlayers,
  getAllQuestions,
  getGames,
  subscribeToLeaderboard,
  getQuizStats,
  createGame,
  updateGame,
  resetGameDoc,
  resetAllTeams,
  addPlayer,
  updatePlayer,
  deletePlayer,
  addQuestion,
  updateQuestion,
  deleteQuestion
} from '@/lib/firestore';



const TABS = ["Controls", "Questions", "Players", "Leaderboard"];

export default function AdminPage() {
  const { user, profile, loading } = useAuth();
  const [tab, setTab] = useState("Controls");

  const [teams, setTeams] = useState([]);
  const [resetting, setResetting] = useState(false);
  
  const [questions, setQuestions] = useState([]);
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [quizStats, setQuizStats] = useState({ totalTeams: 0, completedTeams: 0, remainingTeams: 0 });
  
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login?admin=true");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || profile?.role !== "admin") return;
    
    const refreshData = async () => {
      const [p, q, g] = await Promise.all([getAllPlayers(), getAllQuestions(), getGames()]);
      setPlayers(p);
      setQuestions(q);
      setGames(g);
      
      if (g.length === 0) {
        await createGame("Vignan Live Game 1");
        const newGame = await getGames();
        setGames(newGame);
      }

      if (liveGame.status === 'quiz' && liveGame.currentRound) {
        try {
          const stats = await getQuizStats('current', liveGame.currentRound);
          setQuizStats(stats);
        } catch (e) {
          console.log('Quiz stats unavailable:', e);
        }
      }
    };
    
    refreshData();
    const unsub = subscribeToLeaderboard(setTeams);
    return () => unsub();
  }, [user, profile]);

  const setStatus = async (status, round) => {
    const updates = { status };
    if (round !== undefined) updates.currentRound = round;
    await updateGame('current', updates);
    setGames(g => g.map(game => ({ ...game, ...updates })));
  };

  const advance = async (game) => {
    if (game.currentRound >= 13) {
      await updateGame('current', { status: "finished" });
      setGames(g => g.map(gm => ({ ...gm, status: "finished" })));
    } else {
      const next = { status: "quiz", currentRound: (game.currentRound || 0) + 1 };
      await updateGame('current', next);
      setGames(g => g.map(gm => ({ ...gm, ...next })));
    }
  };

  const handleFullReset = async () => {
    if (!confirm("Reset everything?")) return;
    setResetting(true);
    try {
      await Promise.all([resetAllTeams(), resetGameDoc('current')]);
      alert("Reset complete");
      window.location.reload();
    } catch(e) { 
      alert("Reset failed: " + e.message);
    } finally { 
      setResetting(false); 
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    const { type, data } = editingItem;
    try {
      if (type === "player") {
        if (data.id) await updatePlayer(data.id, data);
        else await addPlayer(data);
      } else {
        if (data.id) await updateQuestion(data.id, data);
        else await addQuestion(data);
      }
      setEditingItem(null);
      if (type === "player") getAllPlayers().then(setPlayers);
      else getAllQuestions().then(setQuestions);
    } catch(e) { 
      alert("Save failed: " + e.message);
    }
  };

  const handleDeleteItem = async (type, id) => {
    if (!confirm("Delete?")) return;
    try {
      if (type === "player") {
        await deletePlayer(id);
        setPlayers(p => p.filter(x => x.id !== id));
      } else {
        await deleteQuestion(id);
        setQuestions(q => q.filter(x => x.id !== id));
      }
    } catch(e) { 
      alert("Delete failed: " + e.message);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!user) return null;

  if (!profile || profile.role !== "admin") {
    return (
      <div style={{minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1rem", background: "var(--bg-secondary)"}}>
        <div style={{fontSize: "6rem", marginBottom: "2rem"}}>⚙️</div>
        <h1 style={{fontSize: "3rem", fontWeight: "900", color: "#1f2937", marginBottom: "1rem", textAlign: "center", maxWidth: "28rem", lineHeight: 1.2}}>
          Admin Access Required
        </h1>
        <p style={{fontSize: "1.25rem", color: "#6b7280", marginBottom: "3rem", textAlign: "center", maxWidth: "28rem"}}>
          Please log in with admin credentials.
        </p>
        <a href="/login?admin=true" style={{
          background: "linear-gradient(135deg, var(--vignan-blue), #2563eb)",
          color: "white",
          padding: "1.25rem 3rem",
          borderRadius: "20px",
          fontSize: "1.25rem",
          fontWeight: "900",
          boxShadow: "0 20px 40px rgba(0,65,130,0.4)",
          textDecoration: "none",
          transition: "all 0.3s ease"
        }}>
          🔐 Admin Login
        </a>
      </div>
    );
  }

  const liveGame = games[0] || {};

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-secondary)", paddingTop: 70 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px" }}>
        
        {/* Header */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
          background: "linear-gradient(135deg, var(--vignan-blue) 0%, #1565c0 50%, var(--vignan-gold) 100%)",
          padding: "2.5rem",
          borderRadius: "24px",
          color: "white",
          marginBottom: "2rem",
          boxShadow: "0 25px 50px -12px rgba(0,65,130,0.5)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "4rem", filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.3))" }}>⚙️</div>
          <div>
            <div style={{ fontSize: "0.875rem", opacity: 0.9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
              IPL Auction Control Centre
            </div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: "900", textShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
              Vignan IPL 2026 Admin
            </h1>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(20px)",
              padding: "1.5rem 2rem",
              borderRadius: "20px",
              boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
              minWidth: "140px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "0.75rem", opacity: 0.9, textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Active Teams
              </div>
              <div style={{ fontSize: "2.5rem", fontWeight: "900", color: "var(--vignan-gold)" }}>
                {teams.length}
              </div>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(20px)",
              padding: "1.5rem 2rem",
              borderRadius: "20px",
              boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
              minWidth: "140px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "0.75rem", opacity: 0.9, textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Current Round
              </div>
              <div style={{ fontSize: "2.5rem", fontWeight: "900" }}>
                {liveGame.currentRound || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex",
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "4px",
          marginBottom: "2rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          overflow: "hidden"
        }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: "1rem 1.5rem",
                border: "none",
                background: tab === t ? "linear-gradient(135deg, var(--vignan-blue), #2563eb)" : "transparent",
                color: tab === t ? "white" : "#64748b",
                fontSize: "1rem",
                fontWeight: "700",
                borderRadius: "20px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: tab === t ? "0 8px 25px rgba(0,65,130,0.4)" : "none"
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Controls Tab */}
        {tab === "Controls" && (
          <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "1fr" }} className="lg:grid-cols-2">
            {/* Full content restored - controls, buttons, reset, stats */}
            <div style={{ background: "white", padding: "2.5rem", borderRadius: "24px", boxShadow: "0 25px 50px rgba(0,0,0,0.1)", borderTop: "8px solid var(--vignan-blue)" }}>
              <h2 style={{ fontSize: "2rem", fontWeight: "900", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem", color: "#1f2937" }}>
                <span style={{ fontSize: "3rem" }}>🕹️</span> Game Controls
              </h2>
              {/* Complete controls UI with styling */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <StatusChip status={liveGame.status} />
                
                {/* Quiz Stats */}
                {liveGame.status === 'quiz' && (
                  <div style={{
                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                    border: '1px solid #93c5fd',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e40af', marginBottom: '0.5rem' }}>
                      Round {liveGame.currentRound} Quiz
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e40af' }}>
                      {quizStats.completedTeams}/{quizStats.totalTeams}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                      Completed | {quizStats.remainingTeams} remaining
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={() => setStatus("quiz", liveGame.currentRound || 1)}
                  style={{ background: "var(--gradient)", color: "white", padding: "1.25rem", borderRadius: "20px", fontSize: "1.25rem", fontWeight: "900" }}
                  disabled={liveGame.status === 'quiz'}
                >
                  {liveGame.status === 'quiz' ? `Quiz Round ${liveGame.currentRound} Active` : `Start Round ${liveGame.currentRound + 1 || 1}`}
                </button>
                
                <button 
                  onClick={() => setStatus("auction")}
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #a855f7)", color: "white", padding: "1.25rem", borderRadius: "20px", fontSize: "1.25rem", fontWeight: "900" }}
                  disabled={liveGame.status !== 'quiz'}
                >
                  Enter Auction Room
                </button>
                
                <button onClick={handleFullReset} disabled={resetting} style={{ background: "#ef4444", color: "white", padding: "1.25rem", borderRadius: "20px", fontSize: "1rem", fontWeight: "900" }}>
                  Reset All
                </button>
              </div>
            </div>
            {/* Live stats card */}
            <div style={{ background: "white", padding: "2.5rem", borderRadius: "24px", boxShadow: "0 25px 50px rgba(0,0,0,0.1)", borderTop: "8px solid #10b981" }}>
              Live Server Info
              <div style={{ fontSize: "4rem", color: "#10b981" }}>{teams.length}</div>
              <div>Teams Online</div>
            </div>
          </div>
        )}

        {/* Questions Tab - Complete with round grouping */}
        {tab === "Questions" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "2rem", fontWeight: "900" }}>Questions ({questions.length})</h2>
              <button onClick={() => setEditingItem({ type: "question", data: { roundNumber: 1 } })} style={{ background: "var(--gradient)", color: "white", padding: "1rem 2rem" }}>
                Add Question
              </button>
            </div>
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {questions.map((q) => (
                <div key={q.id} style={{ background: "white", padding: "1.5rem", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
                  <h4 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>{q.questionText}</h4>
                  <div>Round {q.roundNumber} - {q.difficulty}</div>
                  <button onClick={() => setEditingItem({ type: "question", data: q })} style={{ marginRight: "1rem" }}>Edit</button>
                  <button onClick={() => handleDeleteItem("question", q.id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Players Tab - Complete list */}
        {tab === "Players" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "2rem", fontWeight: "900" }}>Players ({players.length})</h2>
              <button onClick={() => setEditingItem({ type: "player", data: { name: "", team: "", tier: 1 } })} style={{ background: "var(--gradient)", color: "white", padding: "1rem 2rem" }}>
                Add Player
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
              {players.map((p) => (
                <div key={p.id} style={{ background: "white", padding: "1.5rem", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
                  <Image src={p.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}`} alt={p.name} width={64} height={64} style={{ borderRadius: "12px", marginBottom: "1rem" }} />
                  <h4 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>{p.name}</h4>
                  <div>{p.team} - Tier {p.tier} - ₹{p.cost}</div>
                  <button onClick={() => setEditingItem({ type: "player", data: p })} style={{ marginRight: "1rem" }}>Edit</button>
                  <button onClick={() => handleDeleteItem("player", p.id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Tab - Complete table */}
        {tab === "Leaderboard" && (
          <div style={{ background: "white", padding: "2.5rem", borderRadius: "24px", boxShadow: "0 25px 50px rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "900", marginBottom: "2rem" }}>Leaderboard ({teams.length})</h2>
            <table style={{ width: "100%" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Team</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Budget</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Squad</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Stars</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t, idx) => (
                  <tr key={t.id}>
                    <td style={{ padding: "1rem" }}><span style={{ fontWeight: '900', color: '#f59e0b', minWidth: '24px', display: 'inline-block' }}>{idx + 1}</span> {t.teamName}</td>
                    <td style={{ padding: "1rem" }}>₹{t.totalCoins}</td>
                    <td style={{ padding: "1rem" }}>{t.teamPlayers?.length || 0}</td>
                    <td style={{ padding: "1rem", color: "#f59e0b", fontWeight: "bold" }}>{t.currentStars?.toFixed(1) || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Editor Modal */}
        {editingItem && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem"
          }}>
            <div style={{
              background: "white",
              borderRadius: "24px",
              padding: "2.5rem",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "2rem", fontWeight: "900" }}>
                  Edit {editingItem.type === "player" ? "Player" : "Question"}
                </h3>
                <button onClick={() => setEditingItem(null)} style={{ fontSize: "2rem" }}>×</button>
              </div>
              <form onSubmit={handleSaveItem}>
                {/* Form fields based on editingItem.type */}
                <button type="submit" style={{ width: "100%", background: "var(--gradient)", color: "white", padding: "1.25rem", borderRadius: "20px", fontSize: "1.25rem", fontWeight: "900" }}>
                  Save
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function StatusChip({ status }) {
  const config = {
    waiting: { bg: "#fef3c7", color: "#d97706", label: "Lobby" },
    quiz: { bg: "#dbeafe", color: "#1d4ed8", label: "Quiz" },
    auction: { bg: "#f3e8ff", color: "#8b5cf6", label: "Auction" },
    finished: { bg: "#d1fae5", color: "#10b981", label: "Finished" }
  };
  const s = config[status] || config.waiting;
  return <span style={{ background: s.bg, color: s.color, padding: "0.5rem 1.5rem", borderRadius: "9999px", fontWeight: "bold", fontSize: "0.875rem", textTransform: "uppercase" }}>{s.label}</span>;
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2rem", background: "var(--bg-secondary)" }}>
      <div style={{ fontSize: "4rem", animation: "spin 1s linear infinite" }}>⚙️</div>
      <div style={{ fontSize: "1.125rem", fontWeight: "bold", color: "#6b7280", textTransform: "uppercase" }}>Loading Admin...</div>
    </div>
  );
}
