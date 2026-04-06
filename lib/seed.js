// Run this to seed Firestore with all questions and players.
import { db, auth } from './firebase';
import { collection, addDoc, getDocs, doc, setDoc, query, where, serverTimestamp } from 'firebase/firestore';

// ── QUESTIONS ──────────────────────────────────────────────────────────────
const QUESTIONS = [
  // Round 1
  { roundNumber: 1, difficulty: 'easy',   timeLimit: 15, points: 100, penalty: -20,  questionText: "Who is known as 'Captain Cool'?", options: ['A) Rohit Sharma', 'B) Virat Kohli', 'C) MS Dhoni', 'D) Hardik Pandya'], correctIndex: 2 },
  { roundNumber: 1, difficulty: 'medium', timeLimit: 30, points: 200, penalty: -50,  questionText: 'Which team won the very first IPL in 2008?', options: ['A) CSK', 'B) Rajasthan Royals', 'C) Mumbai Indians', 'D) KKR'], correctIndex: 1 },
  { roundNumber: 1, difficulty: 'hard',   timeLimit: 45, points: 300, penalty: -100, questionText: 'Who was the first player to be "Retired Out" in IPL history?', options: ['A) MS Dhoni', 'B) Rishabh Pant', 'C) R. Ashwin', 'D) Sunil Narine'], correctIndex: 2 },
  // Round 2
  { roundNumber: 2, difficulty: 'easy',   timeLimit: 15, points: 100, penalty: -20,  questionText: 'Which team has a lion in its logo?', options: ['A) CSK', 'B) RCB', 'C) Sunrisers Hyderabad', 'D) Delhi Capitals'], correctIndex: 0 },
  { roundNumber: 2, difficulty: 'medium', timeLimit: 30, points: 200, penalty: -50,  questionText: 'Who hit the fastest century in IPL history (30 balls)?', options: ['A) Travis Head', 'B) Chris Gayle', 'C) AB de Villiers', 'D) Yusuf Pathan'], correctIndex: 1 },
  { roundNumber: 2, difficulty: 'hard',   timeLimit: 45, points: 300, penalty: -100, questionText: 'Which player has been traded the most times between franchises?', options: ['A) Shikhar Dhawan', 'B) Robin Uthappa', 'C) Aaron Finch', 'D) Karun Nair'], correctIndex: 3 },
  // Round 3
  { roundNumber: 3, difficulty: 'easy',   timeLimit: 15, points: 100, penalty: -20,  questionText: 'What color cap is given to the top run-scorer?', options: ['A) Purple', 'B) Orange', 'C) Gold', 'D) Blue'], correctIndex: 1 },
  { roundNumber: 3, difficulty: 'medium', timeLimit: 30, points: 200, penalty: -50,  questionText: 'Which bowler won the first-ever Purple Cap in 2008?', options: ['A) Shane Warne', 'B) RP Singh', 'C) Sohail Tanvir', 'D) Glenn McGrath'], correctIndex: 2 },
  { roundNumber: 3, difficulty: 'hard',   timeLimit: 45, points: 300, penalty: -100, questionText: 'Which city hosted the first-ever IPL match outside India?', options: ['A) Dubai', 'B) Johannesburg', 'C) Cape Town', 'D) Abu Dhabi'], correctIndex: 2 },
  // Round 4
  { roundNumber: 4, difficulty: 'easy',   timeLimit: 15, points: 100, penalty: -20,  questionText: "Which city does the 'Knight Riders' represent?", options: ['A) Mumbai', 'B) Bangalore', 'C) Kolkata', 'D) Lucknow'], correctIndex: 2 },
  { roundNumber: 4, difficulty: 'medium', timeLimit: 30, points: 200, penalty: -50,  questionText: 'Who is the all-time leading wicket-taker in IPL history (as of 2026)?', options: ['A) Dwayne Bravo', 'B) Lasith Malinga', 'C) Yuzvendra Chahal', 'D) Amit Mishra'], correctIndex: 2 },
  { roundNumber: 4, difficulty: 'hard',   timeLimit: 45, points: 300, penalty: -100, questionText: 'Who was the first Indian to score an IPL century?', options: ['A) Virat Kohli', 'B) Manish Pandey', 'C) Suresh Raina', 'D) Rohit Sharma'], correctIndex: 1 },
  // Round 5
  { roundNumber: 5, difficulty: 'easy',   timeLimit: 15, points: 100, penalty: -20,  questionText: 'Who is the captain of Gujarat Titans in the 2025-26 season?', options: ['A) Hardik Pandya', 'B) Shubman Gill', 'C) Rashid Khan', 'D) Kane Williamson'], correctIndex: 1 },
  { roundNumber: 5, difficulty: 'medium', timeLimit: 30, points: 200, penalty: -50,  questionText: 'Which team holds the record for the lowest score (49)?', options: ['A) Delhi Capitals', 'B) KKR', 'C) RCB', 'D) Rajasthan Royals'], correctIndex: 2 },
  { roundNumber: 5, difficulty: 'hard',   timeLimit: 45, points: 300, penalty: -100, questionText: 'Which player hit 37 runs in a single over (off P. Parameswaran)?', options: ['A) Andre Russell', 'B) Rohit Sharma', 'C) Chris Gayle', 'D) Suresh Raina'], correctIndex: 2 },
  // Round 6
  { roundNumber: 6, difficulty: 'easy',   timeLimit: 15, points: 100, penalty: -20,  questionText: 'Max number of overseas players in a playing XI?', options: ['A) 3', 'B) 4', 'C) 5', 'D) 2'], correctIndex: 1 },
  { roundNumber: 6, difficulty: 'medium', timeLimit: 30, points: 200, penalty: -50,  questionText: "Who was 'Man of the Match' in the 2008 IPL Final?", options: ['A) Shane Warne', 'B) Yusuf Pathan', 'C) MS Dhoni', 'D) Sohail Tanvir'], correctIndex: 1 },
  { roundNumber: 6, difficulty: 'hard',   timeLimit: 45, points: 300, penalty: -100, questionText: 'Who is the only player to have taken 3 hat-tricks in the IPL?', options: ['A) Lasith Malinga', 'B) Rashid Khan', 'C) Amit Mishra', 'D) Yuzvendra Chahal'], correctIndex: 2 },
  // Round 7
  { roundNumber: 7, difficulty: 'easy',   timeLimit: 15, points: 100, penalty: -20,  questionText: 'Which team is owned by actor Shah Rukh Khan?', options: ['A) Mumbai Indians', 'B) PBKS', 'C) KKR', 'D) LSG'], correctIndex: 2 },
  { roundNumber: 7, difficulty: 'medium', timeLimit: 30, points: 200, penalty: -50,  questionText: 'Who holds the record for the most ducks in IPL history?', options: ['A) Virat Kohli', 'B) Dinesh Karthik', 'C) MS Dhoni', 'D) Shikhar Dhawan'], correctIndex: 1 },
  { roundNumber: 7, difficulty: 'hard',   timeLimit: 45, points: 300, penalty: -100, questionText: 'Which player was bought for a record ₹25.20 Cr in the 2026 auction?', options: ['A) Mitchell Starc', 'B) Pat Cummins', 'C) Cameron Green', 'D) Sam Curran'], correctIndex: 2 },
  // Round 8
  { roundNumber: 8, difficulty: 'easy',   timeLimit: 15, points: 100, penalty: -20,  questionText: 'How many overs are in a standard T20 innings?', options: ['A) 10', 'B) 50', 'C) 20', 'D) 15'], correctIndex: 2 },
  { roundNumber: 8, difficulty: 'medium', timeLimit: 30, points: 200, penalty: -50,  questionText: 'Which team won the IPL in 2016?', options: ['A) RCB', 'B) CSK', 'C) SRH', 'D) MI'], correctIndex: 2 },
  { roundNumber: 8, difficulty: 'hard',   timeLimit: 45, points: 300, penalty: -100, questionText: 'Who is the youngest player to score an IPL century (at age 14)?', options: ['A) Yashasvi Jaiswal', 'B) Manish Pandey', 'C) Vaibhav Sooryavanshi', 'D) Prithvi Shaw'], correctIndex: 2 },
  // Round 9
  { roundNumber: 9, difficulty: 'easy',   timeLimit: 15, points: 100, penalty: -20,  questionText: 'Which team plays home games at Wankhede Stadium?', options: ['A) KKR', 'B) CSK', 'C) Mumbai Indians', 'D) Delhi Capitals'], correctIndex: 2 },
  { roundNumber: 9, difficulty: 'medium', timeLimit: 30, points: 200, penalty: -50,  questionText: 'Who has played the most IPL matches as captain?', options: ['A) Rohit Sharma', 'B) Gautam Gambhir', 'C) MS Dhoni', 'D) Virat Kohli'], correctIndex: 2 },
  { roundNumber: 9, difficulty: 'hard',   timeLimit: 45, points: 300, penalty: -100, questionText: 'Who was the first overseas player to reach 5,000 IPL runs?', options: ['A) Chris Gayle', 'B) AB de Villiers', 'C) David Warner', 'D) Jos Buttler'], correctIndex: 2 },
  // Round 10
  { roundNumber: 10, difficulty: 'easy',   timeLimit: 15, points: 100, penalty: -20,  questionText: "What does the 'I' in IPL stand for?", options: ['A) International', 'B) Indian', 'C) Indo', 'D) Iconic'], correctIndex: 1 },
  { roundNumber: 10, difficulty: 'medium', timeLimit: 30, points: 200, penalty: -50,  questionText: 'Which bowler has the best bowling figures (6/12)?', options: ['A) Sohail Tanvir', 'B) Anil Kumble', 'C) Alzarri Joseph', 'D) Jasprit Bumrah'], correctIndex: 2 },
  { roundNumber: 10, difficulty: 'hard',   timeLimit: 45, points: 300, penalty: -100, questionText: 'Who was the first player ever bought in the 2008 IPL auction?', options: ['A) MS Dhoni', 'B) Shane Warne', 'C) Akshay Kumar (Trick)', 'D) Muralitharan'], correctIndex: 3 },
  // Round 11
  { roundNumber: 11, difficulty: 'easy',   timeLimit: 15, points: 100, penalty: -20,  questionText: "Which team is nicknamed 'The Yellow Army'?", options: ['A) MI', 'B) KKR', 'C) CSK', 'D) SRH'], correctIndex: 2 },
  { roundNumber: 11, difficulty: 'medium', timeLimit: 30, points: 200, penalty: -50,  questionText: "Which team did the 'Deccan Chargers' transform into?", options: ['A) Gujarat Titans', 'B) SRH', 'C) LSG', 'D) Pune Warriors'], correctIndex: 1 },
  { roundNumber: 11, difficulty: 'hard',   timeLimit: 45, points: 300, penalty: -100, questionText: 'Who won the Emerging Player award in the first season (2008)?', options: ['A) Rohit Sharma', 'B) Shreevats Goswami', 'C) Virat Kohli', 'D) Ajinkya Rahane'], correctIndex: 1 },
  // Round 12
  { roundNumber: 12, difficulty: 'easy',   timeLimit: 15, points: 100, penalty: -20,  questionText: 'Who hit 6 sixes in an over for India (T20 World Cup)?', options: ['A) Yuvraj Singh', 'B) MS Dhoni', 'C) Rohit Sharma', 'D) Hardik Pandya'], correctIndex: 0 },
  { roundNumber: 12, difficulty: 'medium', timeLimit: 30, points: 200, penalty: -50,  questionText: 'Which wicketkeeper has the most dismissals in IPL?', options: ['A) Dinesh Karthik', 'B) Rishabh Pant', 'C) MS Dhoni', 'D) Quinton de Kock'], correctIndex: 2 },
  { roundNumber: 12, difficulty: 'hard',   timeLimit: 45, points: 300, penalty: -100, questionText: 'Who has the most "Player of the Match" awards in history?', options: ['A) Chris Gayle', 'B) AB de Villiers', 'C) Virat Kohli', 'D) Rohit Sharma'], correctIndex: 1 },
  // Round 13
  { roundNumber: 13, difficulty: 'easy',   timeLimit: 15, points: 100, penalty: -20,  questionText: "Which team's anthem is 'Halla Bol'?", options: ['A) KKR', 'B) MI', 'C) Rajasthan Royals', 'D) CSK'], correctIndex: 2 },
  { roundNumber: 13, difficulty: 'medium', timeLimit: 30, points: 200, penalty: -50,  questionText: 'Who led RCB to their maiden IPL title in 2025?', options: ['A) Faf du Plessis', 'B) Virat Kohli', 'C) Rajat Patidar', 'D) Glenn Maxwell'], correctIndex: 2 },
  { roundNumber: 13, difficulty: 'hard',   timeLimit: 45, points: 300, penalty: -100, questionText: 'Which stadium has hosted the most IPL matches in history?', options: ['A) Wankhede', 'B) Eden Gardens', 'C) M. Chinnaswamy', 'D) MA Chidambaram'], correctIndex: 2 },
];

// ── PLAYERS ────────────────────────────────────────────────────────────────
const PLAYERS = [
  // Round 1
  { roundNumber: 1,  name: 'Virat Kohli', team: 'RCB', tier: 1, cost: 1500, stars: 5, role: 'BAT', photoUrl: 'https://ui-avatars.com/api/?name=Virat+Kohli&background=cc0000&color=fff&size=128' },
  { roundNumber: 1,  name: 'Rinku Singh', team: 'KKR', tier: 2, cost: 800,  stars: 3.5, role: 'BAT', photoUrl: 'https://ui-avatars.com/api/?name=Rinku+Singh&background=3a225d&color=fff&size=128' },
  { roundNumber: 1,  name: 'Sameer Rizvi', team: 'CSK', tier: 3, cost: 300,  stars: 2, role: 'BAT', photoUrl: 'https://ui-avatars.com/api/?name=Sameer+Rizvi&background=f9d71c&color=004182&size=128' },
  // Round 2
  { roundNumber: 2,  name: 'MS Dhoni', team: 'CSK', tier: 1, cost: 1500, stars: 5, role: 'WK',  photoUrl: 'https://ui-avatars.com/api/?name=MS+Dhoni&background=f9d71c&color=004182&size=128' },
  { roundNumber: 2,  name: 'Shivam Dube', team: 'CSK', tier: 2, cost: 800,  stars: 3.5, role: 'AR',  photoUrl: 'https://ui-avatars.com/api/?name=Shivam+Dube&background=f9d71c&color=004182&size=128' },
  { roundNumber: 2,  name: 'Angkrish Raghuvanshi', team: 'KKR', tier: 3, cost: 300, stars: 2, role: 'BAT', photoUrl: 'https://ui-avatars.com/api/?name=Angkrish+Raghuvanshi&background=3a225d&color=fff&size=128' },
  // Round 3
  { roundNumber: 3,  name: 'Rohit Sharma', team: 'MI', tier: 1, cost: 1500, stars: 5, role: 'BAT', photoUrl: 'https://ui-avatars.com/api/?name=Rohit+Sharma&background=004182&color=fff&size=128' },
  { roundNumber: 3,  name: 'Arshdeep Singh', team: 'PBKS', tier: 2, cost: 800,  stars: 3.5, role: 'BOWL',photoUrl: 'https://ui-avatars.com/api/?name=Arshdeep+Singh&background=ed1b24&color=fff&size=128' },
  { roundNumber: 3,  name: 'Vaibhav Suryavanshi', team: 'RR', tier: 3, cost: 300,  stars: 2, role: 'BAT', photoUrl: 'https://ui-avatars.com/api/?name=Vaibhav+Suryavanshi&background=ea1a85&color=fff&size=128' },
  // Round 4
  { roundNumber: 4,  name: 'Jasprit Bumrah', team: 'MI', tier: 1, cost: 1500, stars: 5, role: 'BOWL',photoUrl: 'https://ui-avatars.com/api/?name=Jasprit+Bumrah&background=004182&color=fff&size=128' },
  { roundNumber: 4,  name: 'Tilak Varma', team: 'MI', tier: 2, cost: 800,  stars: 3.5, role: 'BAT', photoUrl: 'https://ui-avatars.com/api/?name=Tilak+Varma&background=004182&color=fff&size=128' },
  { roundNumber: 4,  name: 'Naman Dhir', team: 'MI', tier: 3, cost: 300,  stars: 2, role: 'AR',  photoUrl: 'https://ui-avatars.com/api/?name=Naman+Dhir&background=004182&color=fff&size=128' },
  // Round 5
  { roundNumber: 5,  name: 'Rashid Khan', team: 'GT', tier: 1, cost: 1500, stars: 5, role: 'BOWL',photoUrl: 'https://ui-avatars.com/api/?name=Rashid+Khan&background=1c3c7a&color=fff&size=128' },
  { roundNumber: 5,  name: 'Ravi Bishnoi', team: 'RR', tier: 2, cost: 800,  stars: 3.5, role: 'BOWL',photoUrl: 'https://ui-avatars.com/api/?name=Ravi+Bishnoi&background=ea1a85&color=fff&size=128' },
  { roundNumber: 5,  name: 'Ashutosh Sharma', team: 'PBKS', tier: 3, cost: 300,  stars: 2, role: 'BAT', photoUrl: 'https://ui-avatars.com/api/?name=Ashutosh+Sharma&background=ed1b24&color=fff&size=128' },
  // Round 6
  { roundNumber: 6,  name: 'Heinrich Klaasen', team: 'SRH', tier: 1, cost: 1500, stars: 5, role: 'WK',  photoUrl: 'https://ui-avatars.com/api/?name=Heinrich+Klaasen&background=f26522&color=fff&size=128' },
  { roundNumber: 6,  name: 'Pathum Nissanka', team: 'DC', tier: 2, cost: 800,  stars: 3.5, role: 'BAT', photoUrl: 'https://ui-avatars.com/api/?name=Pathum+Nissanka&background=0078bc&color=fff&size=128' },
  { roundNumber: 6,  name: 'Kartik Sharma', team: 'CSK', tier: 3, cost: 300,  stars: 2, role: 'AR',  photoUrl: 'https://ui-avatars.com/api/?name=Kartik+Sharma&background=f9d71c&color=004182&size=128' },
  // Round 7
  { roundNumber: 7,  name: 'Cameron Green', team: 'KKR', tier: 1, cost: 1500, stars: 5, role: 'AR',  photoUrl: 'https://ui-avatars.com/api/?name=Cameron+Green&background=3a225d&color=fff&size=128' },
  { roundNumber: 7,  name: 'Mitchell Marsh', team: 'DC', tier: 2, cost: 800,  stars: 3.5, role: 'AR',  photoUrl: 'https://ui-avatars.com/api/?name=Mitchell+Marsh&background=0078bc&color=fff&size=128' },
  { roundNumber: 7,  name: 'Ramandeep Singh', team: 'KKR', tier: 3, cost: 300,  stars: 2, role: 'BAT', photoUrl: 'https://ui-avatars.com/api/?name=Ramandeep+Singh&background=3a225d&color=fff&size=128' },
  // Round 8
  { roundNumber: 8,  name: 'Shubman Gill', team: 'GT', tier: 1, cost: 1500, stars: 5, role: 'BAT', photoUrl: 'https://ui-avatars.com/api/?name=Shubman+Gill&background=1c3c7a&color=fff&size=128' },
  { roundNumber: 8,  name: 'Dhruv Jurel', team: 'RR', tier: 2, cost: 800,  stars: 3.5, role: 'WK',  photoUrl: 'https://ui-avatars.com/api/?name=Dhruv+Jurel&background=ea1a85&color=fff&size=128' },
  { roundNumber: 8,  name: 'Prashant Veer', team: 'CSK', tier: 3, cost: 300,  stars: 2, role: 'BOWL',photoUrl: 'https://ui-avatars.com/api/?name=Prashant+Veer&background=f9d71c&color=004182&size=128' },
  // Round 9
  { roundNumber: 9,  name: 'Rishabh Pant', team: 'LSG', tier: 1, cost: 1500, stars: 5, role: 'WK',  photoUrl: 'https://ui-avatars.com/api/?name=Rishabh+Pant&background=009b4e&color=fff&size=128' },
  { roundNumber: 9,  name: 'Jitesh Sharma', team: 'PBKS', tier: 2, cost: 800,  stars: 3.5, role: 'WK',  photoUrl: 'https://ui-avatars.com/api/?name=Jitesh+Sharma&background=ed1b24&color=fff&size=128' },
  { roundNumber: 9,  name: 'Robin Minz', team: 'MI', tier: 3, cost: 300,  stars: 2, role: 'WK',  photoUrl: 'https://ui-avatars.com/api/?name=Robin+Minz&background=004182&color=fff&size=128' },
  // Round 10
  { roundNumber: 10, name: 'Hardik Pandya', team: 'MI', tier: 1, cost: 1500, stars: 5, role: 'AR',  photoUrl: 'https://ui-avatars.com/api/?name=Hardik+Pandya&background=004182&color=fff&size=128' },
  { roundNumber: 10, name: 'Axar Patel', team: 'DC', tier: 2, cost: 800,  stars: 3.5, role: 'AR',  photoUrl: 'https://ui-avatars.com/api/?name=Axar+Patel&background=0078bc&color=fff&size=128' },
  { roundNumber: 10, name: 'Prabhsimran Singh', team: 'PBKS', tier: 3, cost: 300,  stars: 2, role: 'WK',  photoUrl: 'https://ui-avatars.com/api/?name=Prabhsimran+Singh&background=ed1b24&color=fff&size=128' },
  // Adding more players for rounds 11, 12, 13 to complete 39
  { roundNumber: 11, name: 'Sanju Samson', team: 'RR', tier: 1, cost: 1500, stars: 5, role: 'WK', photoUrl: 'https://ui-avatars.com/api/?name=Sanju+Samson&background=ea1a85&color=fff&size=128' },
  { roundNumber: 11, name: 'Liam Livingstone', team: 'PBKS', tier: 2, cost: 800, stars: 3.5, role: 'AR', photoUrl: 'https://ui-avatars.com/api/?name=Liam+Livingstone&background=ed1b24&color=fff&size=128' },
  { roundNumber: 11, name: 'Mayank Yadav', team: 'LSG', tier: 3, cost: 300, stars: 2, role: 'BOWL', photoUrl: 'https://ui-avatars.com/api/?name=Mayank+Yadav&background=009b4e&color=fff&size=128' },
  { roundNumber: 12, name: 'Andre Russell', team: 'KKR', tier: 1, cost: 1500, stars: 5, role: 'AR', photoUrl: 'https://ui-avatars.com/api/?name=Andre+Russell&background=3a225d&color=fff&size=128' },
  { roundNumber: 12, name: 'Shimron Hetmyer', team: 'RR', tier: 2, cost: 800, stars: 3.5, role: 'BAT', photoUrl: 'https://ui-avatars.com/api/?name=Shimron+Hetmyer&background=ea1a85&color=fff&size=128' },
  { roundNumber: 12, name: 'Rasikh Salam', team: 'DC', tier: 3, cost: 300, stars: 2, role: 'BOWL', photoUrl: 'https://ui-avatars.com/api/?name=Rasikh+Salam&background=0078bc&color=fff&size=128' },
  { roundNumber: 13, name: 'Quinton de Kock', team: 'LSG', tier: 1, cost: 1500, stars: 5, role: 'WK', photoUrl: 'https://ui-avatars.com/api/?name=Quinton+de+Kock&background=009b4e&color=fff&size=128' },
  { roundNumber: 13, name: 'Ravi Ashwin', team: 'RR', tier: 2, cost: 800, stars: 3.5, role: 'AR', photoUrl: 'https://ui-avatars.com/api/?name=Ravi+Ashwin&background=ea1a85&color=fff&size=128' },
  { roundNumber: 13, name: 'Nehal Wadhera', team: 'MI', tier: 3, cost: 300, stars: 2, role: 'BAT', photoUrl: 'https://ui-avatars.com/api/?name=Nehal+Wadhera&background=004182&color=fff&size=128' },
];

export async function seedAll() {
  // Seed questions
  const qSnap = await getDocs(collection(db, 'questions'));
  for (const q of QUESTIONS) {
     // Check if question exists for this round and difficulty
     const existing = await getDocs(query(collection(db, 'questions'), where('roundNumber', '==', q.roundNumber), where('difficulty', '==', q.difficulty)));
     if (existing.empty) {
        await addDoc(collection(db, 'questions'), q);
     }
  }
  console.log('Questions seeded ✓');

  // Seed players
  for (const p of PLAYERS) {
    const existing = await getDocs(query(collection(db, 'players'), where('name', '==', p.name)));
    if (existing.empty) {
      await addDoc(collection(db, 'players'), p);
    }
  }
  console.log('Players seeded ✓');
}

export async function seedAdmin() {
  // Use the admin UID if known, or search by email.
  // Since we use Firebase Auth, we usually need the UID.
  // For simplicity, we can create the profile if it's missing for the email.
  // But Firestore doesn't store emails in the doc unless we add it.
  // The login uses ipladmin@gmail.com / Vignan@ipl.
  console.log('Admin seeding should be done after login if needed, or by UID.');
}

export async function ensureAdminDoc(uid) {
  await setDoc(doc(db, 'users', uid), {
    uid,
    teamName: 'Admin Control',
    role: 'admin',
    createdAt: serverTimestamp(),
  }, { merge: true });
  console.log('Admin profile ensured ✓');
}

export { QUESTIONS, PLAYERS };

