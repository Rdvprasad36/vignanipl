# IPL Quiz & Auction - Complete TODO
Status Legend: ✅ Done | ⏳ In Progress | ⭕ Pending

## Approved Plan Breakdown (Quiz Fix + Deploy)

### 1. **Update TODO.md** ✅ (Current file)

### 2. **Fix QuizPanel.jsx** ✅
   - Timer useEffect + countdown + auto-timeout
   - timestamp → Date.now()
   - recordAnswer integration
   - State resets between Qs
   - Time defaults implemented

### 3. **Tweak Game Page** ✅
   - Added questionsLoading state
   - Better quiz loading/error UI
   - Disabled market in quiz mode

### 4. **Local Test** ⏳
   - `npm run dev`
   - Admin: create game, start round 1 quiz
   - Team: register/login, play quiz → check coins/Firestore

### 4. **Local Test** ⭕
   - `npm run dev`
   - Admin: create game, start round 1 quiz
   - Team: register/login, play quiz → check coins/Firestore

### 5. **Git Setup & Push** ⭕
   - git remote add origin https://github.com/Rdvprasad36/vignanipl.git
   - git add . && git commit -m 'Fix quiz timer + full working game'
   - git push -u origin main

### 6. **Vercel Deploy** ⭕
   - vercel --prod
   - Verify https://vignanipl.vercel.app

### 7. **Final Verification** ⭕
   - Admin controls rounds
   - Teams play quiz/auction
   - Leaderboard/results

**Next: Step 3 - Game page tweaks + test**


