'use client';
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { subscribeToGame, subscribeToUser, getQuestionsForQuizRound, getPlayersForRound, getAllPlayers } from "@/lib/firestore";
import GameHeader from "./components/GameHeader";
import QuizPanel from "./components/QuizPanel";
import AuctionPanel from "./components/AuctionPanel";
import PlayerMarket from "./components/PlayerMarket";
import TeamRoster from "./components/TeamRoster";
import Link from "next/link";

export default function GamePage() {
  const params = useParams();
  const { gameId } = params;
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [game, setGame] = useState(null);
  const [userData, setUserData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [players, setPlayers] = useState([]);
  const [phase, setPhase] = useState("loading");
  const [questionsLoading, setQuestionsLoading] = useState(false);
  
  // Mobile UI States
  const [showRoster, setShowRoster] = useState(false);
  const [showMarket, setShowMarket] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    const unsub = subscribeToGame("current", setGame);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUser(user.uid, setUserData);
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!game) return;
    setPhase(game.status === "finished" ? "finished" : game.status || "waiting");
    
    const loadData = async () => {
      try {
        if (game.status === "quiz") {
          setQuestionsLoading(true);
          const qs = await getQuestionsForQuizRound(game.currentRound);
          const ps = await getPlayersForRound(game.currentRound);
          const order = { easy: 0, medium: 1, hard: 2 };
          qs.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
          setQuestions(qs);
          setPlayers(ps);
        } else if (game.status === "auction") {
          const all = await getAllPlayers();
          setPlayers(all);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setQuestionsLoading(false);
      }
    };
    
    loadData();
  }, [game?.status, game?.currentRound]);

  if (loading || !user || !game) return <GameLoading />;

  const data = userData || profile;

  const isQuizLoading = phase === "quiz" && questionsLoading;

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] pt-16 pb-24 lg:pb-0">
      <GameHeader game={game} coins={data?.totalCoins ?? 2000} stars={data?.currentStars ?? 0} />

      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left: Player Market */}
          {phase !== "quiz" && (
            <div className={`fixed inset-0 z-[60] lg:relative lg:inset-auto lg:z-0 lg:block lg:w-[300px] transition-transform \${showMarket ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
              <div className="h-full bg-white lg:bg-transparent lg:h-auto shadow-2xl lg:shadow-none p-6 pt-20 lg:p-0 overflow-y-auto">
                <button onClick={() => setShowMarket(false)} className="lg:hidden absolute top-6 right-6 text-2xl">✕</button>
                <PlayerMarket players={players.filter(p => p.roundNumber <= game.currentRound)} ownedIds={data?.teamPlayers?.map(p => p.id) || []} />
              </div>
            </div>
          )}

          {/* Center: Main Action */}
          <div className="flex-1 flex flex-col gap-6">
            {phase === "waiting" && <WaitingState />}
            
            {isQuizLoading && (
              <div className="card p-20 flex flex-col items-center justify-center gap-4">
                <div className="text-3xl animate-spin text-[var(--vignan-blue)]">❓</div>
                <div className="text-lg font-bold">Loading Questions...</div>
              </div>
            )}

            {phase === "quiz" && !isQuizLoading && questions.length > 0 && (
              <QuizPanel
                key={`quiz-\${game.currentRound}`}
                questions={questions}
                userId={user.uid}
                currentCoins={data?.totalCoins ?? 2000}
                round={game.currentRound}
              />
            )}

            {phase === "auction" && (
              <AuctionPanel
                key={`auction-\${game.currentRound}`}
                players={players}
                userId={user.uid}
                teamName={data.teamName}
                currentCoins={data?.totalCoins ?? 2000}
                ownedIds={data?.teamPlayers?.map(p => p.id) || []}
                round={game.currentRound}
              />
            )}

            {phase === "finished" && <FinishedState gameId={gameId} data={data} />}

            {(phase === "quiz" && questions.length === 0 && !isQuizLoading) && (
              <div className="card p-20 flex flex-col items-center justify-center gap-4">
                <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">No Questions</h2>
                <p className="text-gray-400">Contact admin to load round {game.currentRound}</p>
              </div>
            )}
          </div>

          {/* Right: Team Roster */}
          <div className={`fixed inset-0 z-[60] lg:relative lg:inset-auto lg:z-0 lg:block lg:w-[300px] transition-transform \${showRoster ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
            <div className="h-full bg-white lg:bg-transparent lg:h-auto shadow-2xl lg:shadow-none p-6 pt-20 lg:p-0 overflow-y-auto">
              <button onClick={() => setShowRoster(false)} className="lg:hidden absolute top-6 left-6 text-2xl">✕</button>
              <TeamRoster players={data?.teamPlayers || []} coins={data?.totalCoins ?? 2000} stars={data?.currentStars ?? 0} />
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-t border-[var(--border)] z-[50] flex items-center justify-around px-6">
        <button onClick={() => setShowMarket(true)} className="flex flex-col items-center gap-1 group" disabled={phase === "quiz"}>
          <span className="text-xl group-active:scale-95 transition-transform">🏷️</span>
          <span className="text-[10px] font-bold uppercase tracking-tight text-gray-500">Market</span>
        </button>
        <div className="w-12 h-12 bg-[var(--gradient)] rounded-full flex items-center justify-center text-white shadow-lg -translate-y-6 border-4 border-[var(--bg-secondary)]">
          <span className="text-xl">🏏</span>
        </div>
        <button onClick={() => setShowRoster(true)} className="flex flex-col items-center gap-1 group">
          <span className="text-xl group-active:scale-95 transition-transform">🧢</span>
          <span className="text-[10px] font-bold uppercase tracking-tight text-gray-500">My Team</span>
        </button>
      </div>

      {(showRoster || showMarket) && <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[55] lg:hidden" onClick={() => { setShowRoster(false); setShowMarket(false); }} />}
    </div>
  );
}

// Components...
function WaitingState() {
  return (
    <div className="card p-20 flex flex-col items-center justify-center text-center phase-enter shadow-2xl">
      <div className="text-6xl mb-6">⏱️</div>
      <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">Entering Arena</h2>
      <p className="text-gray-400 text-sm max-w-[300px]">The Match Director is preparing the round. Stay focused, the quiz will begin automatically.</p>
      <div className="w-1.5 h-1.5 bg-[var(--vignan-blue)] rounded-full mt-8 animate-ping" />
    </div>
  );
}

function FinishedState({ gameId, data }) {
  return (
    <div className="card p-20 flex flex-col items-center justify-center text-center phase-enter shadow-2xl border-b-8 border-[var(--vignan-gold)]">
      <div className="text-6xl mb-6">🏆</div>
      <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">Tournament Ended</h2>
      <p className="text-gray-400 text-sm mb-8">All 13 rounds are complete. High scores are being calculated.</p>
      {data?.finalSquad ? (
        <div className="bg-green-100 text-green-700 p-3 px-6 rounded-full text-xs font-bold uppercase tracking-widest">✅ Squad Submitted</div>
      ) : (
        <Link href={`/game/${gameId}/final`} className="btn btn-gold px-10 py-5 font-black text-lg shadow-xl hover:scale-105 transition-transform">
          📋 Final Selection →
        </Link>
      )}
    </div>
  );
}

function GameLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--bg-secondary)]">
      <div className="animate-spin text-3xl font-black">🏏</div>
      <div className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Connecting to server...</div>
    </div>
  );
}'

