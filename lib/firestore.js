import {
  doc, setDoc, getDoc, updateDoc, collection,
  addDoc, getDocs, query, where, orderBy, onSnapshot, serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// ── Users ──────────────────────────────────────────────────────────────────

export async function createUserDoc(uid, teamName, role = 'team', leaderName = '', whatsapp = '', rollNumber = '', tier = 'medium') {
  await setDoc(doc(db, 'users', uid), {
    uid,
    teamName,
    leaderName,
    whatsapp,
    rollNumber,
    role,
    tier,
    totalCoins: 2000,
    currentStars: 0,
    teamPlayers: [],
    currentRound: 0,
    answers: [],
    finalSquad: null,
    finalStars: 0,
    finalCoins: 0,
    createdAt: serverTimestamp(),
  });
}

export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateUserCoins(uid, newCoins) {
  await updateDoc(doc(db, 'users', uid), { totalCoins: newCoins });
}

export async function addPlayerToTeam(uid, player, newCoins) {
  const snap = await getDoc(doc(db, 'users', uid));
  const data = snap.data();
  const updated = [...(data.teamPlayers || []), player];
  await updateDoc(doc(db, 'users', uid), {
    teamPlayers: updated,
    totalCoins: newCoins,
    currentStars: updated.reduce((s, p) => s + (p.stars || 0), 0),
  });
}

export async function submitFinalSquad(uid, finalSquad, captainId, impactId, finalStars, finalCoins) {
  await updateDoc(doc(db, 'users', uid), {
    finalSquad,
    captainId,
    impactId,
    finalStars,
    finalCoins,
  });
}

export async function recordAnswer(uid, round, difficulty, correct, coinsEarned) {
  const snap = await getDoc(doc(db, 'users', uid));
  const data = snap.data();
  const answers = data?.answers || [];
  answers.push({ round, difficulty, correct, coinsEarned, ts: Date.now() });
  await updateDoc(doc(db, 'users', uid), {
    answers,
    totalCoins: (data.totalCoins || 2000) + coinsEarned,
  });
  return (data.totalCoins || 2000) + coinsEarned;
}

export async function resetAllTeams() {
  const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'team')));
  const promises = snap.docs.map(d => updateDoc(doc(db, 'users', d.id), {
    totalCoins: 2000,
    currentStars: 0,
    teamPlayers: [],
    currentRound: 0,
    answers: [],
    finalSquad: null,
    finalStars: 0,
    finalCoins: 0,
  }));
  await Promise.all(promises);

  // Also reset all players to unpurchased
  const pSnap = await getDocs(collection(db, 'players'));
  const pPromises = pSnap.docs.map(d => updateDoc(doc(db, 'players', d.id), {
    isPurchased: false,
    purchasedBy: null,
  }));
  await Promise.all(pPromises);
}

// ── Admin Queries ──────────────────────────────────────────────────────────

export async function getAdminCount() {
  const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'admin')));
  return snap.size;
}

export async function getQuizStats(gameId, currentRound) {
  const teamsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'team')));
  const totalTeams = teamsSnap.size;
  
  const completed = [];
  for (const doc of teamsSnap.docs) {
    const data = doc.data();
    const roundAnswers = data.answers?.filter(a => a.round === currentRound) || [];
    if (roundAnswers.length >= 3) completed.push(doc.id);
  }
  
  return {
    totalTeams,
    completedTeams: completed.length,
    remainingTeams: totalTeams - completed.length,
    completedTeamIds: completed
  };
}

export async function listAdmins() {
  const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'admin')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Games ──────────────────────────────────────────────────────────────────

export async function createGame(gameName) {
  await setDoc(doc(db, 'gameState', 'current'), {
    gameName,
    status: 'waiting',
    currentRound: 1,
    activeQuestionId: null,
    timerEnd: null,
    createdAt: serverTimestamp(),
  });
  return 'current';
}

export async function updateGame(gameId, updates) {
  await updateDoc(doc(db, 'gameState', 'current'), updates);
}

export async function resetGameDoc(gameId) {
  await updateDoc(doc(db, 'gameState', 'current'), {
    status: 'waiting',
    currentRound: 1,
    activeQuestionId: null,
    timerEnd: null,
  });
}

export async function getGames() {
  const snap = await getDoc(doc(db, 'gameState', 'current'));
  return snap.exists() ? [{ id: 'current', ...snap.data() }] : [];
}

export function subscribeToGame(gameId, cb) {
  return onSnapshot(doc(db, 'gameState', 'current'), snap => {
    if (snap.exists()) cb({ id: 'current', ...snap.data() });
  });
}

export function subscribeToUser(uid, cb) {
  return onSnapshot(doc(db, 'users', uid), snap => {
    if (snap.exists()) cb(snap.data());
  });
}

export function subscribeToLeaderboard(cb) {
  return onSnapshot(collection(db, 'users'), snap => {
    const teams = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(u => u.role === 'team')
      .sort((a, b) =>
        (b.finalStars || b.currentStars) - (a.finalStars || a.currentStars) ||
        (b.finalCoins || b.totalCoins) - (a.finalCoins || a.totalCoins)
      );
    cb(teams);
  });
}

// ── Questions ──────────────────────────────────────────────────────────────

export async function getQuestionsForRound(roundNumber, tier = 'medium') {
  let q = query(collection(db, 'questions'), where('roundNumber', '==', roundNumber));
  if (tier !== 'all') {
    q = query(q, where('tier', '==', tier));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getQuestionsForQuizRound(roundNumber) {
  const [easy, medium, hard] = await Promise.all([
    getQuestionsForRound(roundNumber, 'easy'),
    getQuestionsForRound(roundNumber, 'medium'),
    getQuestionsForRound(roundNumber, 'hard')
  ]);
  return [...easy, ...medium, ...hard];
}

// ── Players ────────────────────────────────────────────────────────────────

export async function getPlayersForRound(roundNumber) {
  const snap = await getDocs(
    query(collection(db, 'players'), where('roundNumber', '==', roundNumber))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllPlayers() {
  const snap = await getDocs(query(collection(db, 'players'), orderBy('roundNumber', 'asc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── NEW CRUD FUNCTIONS ──────────────────────────────────────────────────────

// Questions
export async function addQuestion(q) {
  return await addDoc(collection(db, 'questions'), q);
}
export async function updateQuestion(id, q) {
  await updateDoc(doc(db, 'questions', id), q);
}
export async function deleteQuestion(id) {
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, 'questions', id));
}
export async function getAllQuestions() {
  const snap = await getDocs(query(collection(db, 'questions'), orderBy('roundNumber', 'asc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Players
export async function addPlayer(p) {
  return await addDoc(collection(db, 'players'), p);
}
export async function updatePlayer(id, p) {
  await updateDoc(doc(db, 'players', id), p);
}
export async function deletePlayer(id) {
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, 'players', id));
}

export async function buyPlayer(uid, player, teamName) {
  const { runTransaction } = await import('firebase/firestore');
  return await runTransaction(db, async (transaction) => {
    const pRef = doc(db, 'players', player.id);
    const uRef = doc(db, 'users', uid);
    
    const pSnap = await transaction.get(pRef);
    const uSnap = await transaction.get(uRef);
    
    if (!pSnap.exists()) throw "Player not found";
    if (pSnap.data().isPurchased) throw "Already purchased";
    
    const userData = uSnap.data();
    if (userData.totalCoins < player.cost) throw "Insufficient coins";
    
    transaction.update(pRef, { isPurchased: true, purchasedBy: teamName, purchasedById: uid });
transaction.update(uRef, {
      teamPlayers: [...(userData.teamPlayers || []), { ...player, purchasedAt: Date.now() }],
      totalCoins: userData.totalCoins - player.cost,
currentStars: (userData.currentStars || 0) + (player.stars || 0)
    });
    return true;
  });
}

export async function getTeamDetails(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  const players = data.finalSquad ? data.teamPlayers.filter(p => data.finalSquad.includes(p.id)) : data.teamPlayers || [];
const categorized = {
    wk: players.filter(p => p.role?.toUpperCase() === 'WK'),
    bat: players.filter(p => p.role?.toUpperCase() === 'BAT'),
    bowl: players.filter(p => p.role?.toUpperCase() === 'BOWL'),
    ar: players.filter(p => p.role?.toUpperCase() === 'AR' || p.role?.toUpperCase() === 'ALL'),
  };
  const squadValid = validateSquad(players);
  return {
    ...data,
    categorized,
    squadValid,
  };
};

export function validateSquad(players) {
  if (players.length !== 11) return false;
  const counts = players.reduce((acc, p) => {
const role = p.role?.toUpperCase();
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});
  return (counts.WK || 0) >= 1 &&
         (counts.BAT || 0) >= 3 &&
         (counts.BOWL || 0) >= 3 &&
         (counts.AR || counts.ALL || 0) >= 1;
};

export async function updateQuizState(gameId, updates) {
  await updateGame(gameId, {
    ...updates,
    ...updates,
  });
}
