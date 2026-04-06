'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { recordAnswer } from '@/lib/firestore';

export default function QuizPanel({ questions, userId, currentCoins, round }) {
  const [qIdx, setQIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selected, setSelected] = useState(null); 
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState(null); 
  const [coinsDelta, setCoinsDelta] = useState(0);
  const [localCoins, setLocalCoins] = useState(currentCoins);
  const [allDone, setAllDone] = useState(false);
  const [shake, setShake] = useState(false);
  const timerRef = useRef(null);

  const q = questions[qIdx];

  const getTimeLimit = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 15;
      case 'medium': return 30;
      case 'hard': return 45;
      default: return 20;
    }
  };

  // Timer logic
  useEffect(() => {
    if (!q || answered || allDone) return;

    const timeLimit = q.timeLimit || getTimeLimit(q.difficulty);
    setTimeLeft(timeLimit);
    setAnswered(false);
    setSelected(null);
    setFeedback(null);
    setShake(false);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [qIdx, answered, allDone]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const handleAnswer = useCallback(async (idx) => {
    if (answered) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const isTimeout = idx === null;
    const isCorrect = !isTimeout && idx === q.correctIndex;
    const delta = isCorrect ? (q.points || 0) : (q.penalty || 0);
    setCoinsDelta(delta);
    const newCoins = Math.max(0, localCoins + delta);
    setLocalCoins(newCoins);
    setAnswered(true);
    setSelected(idx);
    setFeedback(isCorrect ? 'correct' : isTimeout ? 'timeout' : 'wrong');
    if (!isCorrect) setShake(true);

    // Record to Firestore
    try {
      await recordAnswer(userId, round, q.difficulty, isCorrect, delta);
    } catch (e) {
      console.error('Failed to record answer:', e);
    }

    // Next question
    setTimeout(() => {
      if (qIdx + 1 < questions.length) {
        setQIdx(qIdx + 1);
      } else {
        setAllDone(true);
      }
    }, 2500);
  }, [qIdx, answered, q, localCoins, userId, round]);

  if (!q && !allDone) return <div>Loading quiz...</div>;

  if (allDone) {
    return (
      <div className="card text-center p-16 phase-enter shadow-2xl">
        <div className="text-6xl mb-6">🎯</div>
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Round {round} Cleared!</h2>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-8">Ready for the Auction Phase</p>
        <div className="bg-[var(--bg-secondary)] p-6 rounded-[32px] inline-flex flex-col items-center border border-[var(--border)]">
          <span className="text-[10px] font-black uppercase text-gray-400 mb-1">Total Budget</span>
          <span className="text-2xl font-black text-[var(--vignan-blue)]">💰 {localCoins.toLocaleString()}</span>
        </div>
      </div>
    );
  }

  const isLow = timeLeft <= 5;
  const progress = timeLeft > 0 ? (timeLeft / (q.timeLimit || getTimeLimit(q.difficulty))) * 100 : 0;

  return (
    <div className={`card p-8 md:p-12 phase-enter relative overflow-hidden ${shake ? 'shake border-red-500' : ''}`}>
      {/* Background Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100">
        <div 
          className={`h-full transition-all duration-1000 ${isLow ? 'bg-red-500' : 'bg-[var(--vignan-blue)]'}`} 
          style={{ width: `${progress}%` }} 
        />
      </div>

      {/* Header Info */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-2">
          <span className="bg-gray-100 text-gray-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">Q{qIdx + 1} / {questions.length}</span>
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
            q.difficulty === 'easy' ? 'bg-green-50 text-green-600' : 
            q.difficulty === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
          }`}>{q.difficulty}</span>
        </div>
        <div className={`text-2xl font-black tabular-nums transition-colors ${isLow ? 'text-red-500 animate-pulse' : 'text-[var(--vignan-blue)]'}`}>
          {timeLeft}s
        </div>
      </div>

      {/* Question Text */}
      <h2 className="text-xl md:text-2xl font-black tracking-tight leading-snug mb-10 text-gray-900">
        {q.questionText}
      </h2>

      {/* Options Stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {q.options.map((opt, i) => {
          let stateClass = 'bg-gray-50 border-gray-100 text-gray-700 hover:border-[var(--vignan-blue)]';
          if (answered) {
            if (i === q.correctIndex) stateClass = 'bg-green-50 border-green-500 text-green-800 shadow-lg shadow-green-100';
            else if (i === selected) stateClass = 'bg-red-50 border-red-500 text-red-800 opacity-80';
            else stateClass = 'bg-gray-50 border-gray-100 text-gray-300 opacity-50';
          } else if (selected === i) {
            stateClass = 'bg-[var(--vignan-blue)] text-white shadow-xl border-[var(--vignan-blue)]';
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={answered}
              className={`p-5 rounded-3xl border-2 text-left font-bold transition-all flex items-center gap-4 group ${stateClass}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-colors ${
                answered && i === q.correctIndex ? 'bg-green-500 text-white' : 
                answered && i === selected ? 'bg-red-500 text-white' : 'bg-white text-gray-400 group-hover:text-[var(--vignan-blue)] shadow-sm'
              }`}>
                {String.fromCharCode(65 + i)}
              </div>
              <span className="flex-1">{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className={`mt-8 p-5 rounded-3xl text-center font-black uppercase tracking-widest text-sm animate-bounce ${
          feedback === 'correct' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {feedback === 'correct' ? `✅ Perfect! +${coinsDelta}` : feedback === 'timeout' ? `⏰ Timeout ${coinsDelta}` : `❌ Incorrect ${coinsDelta}`}
        </div>
      )}

      {/* Reward Info */}
      {!answered && (
        <div className="mt-8 text-center text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center justify-center gap-4">
          <span>Win: <strong className="text-green-500">+{q.points || 0}</strong></span>
          <div className="w-1 h-1 bg-gray-200 rounded-full" />
          <span>Loss: <strong className="text-red-500">{q.penalty || 0}</strong></span>
        </div>
      )}
    </div>
  );
}'

