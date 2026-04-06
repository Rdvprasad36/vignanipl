'use client';
import { useState } from 'react';
import { buyPlayer } from '@/lib/firestore';

export default function AuctionPanel({ players, userId, teamName, currentCoins, ownedIds, round }) {
  const [buying, setBuying]     = useState(false);
  const [bought, setBought]     = useState(null);
  const [error, setError]       = useState('');
  const [localCoins, setLocalCoins] = useState(currentCoins);

  const tierPlayers = (tier) => players.filter(p => p.tier === tier);

  const handleBuy = async (player) => {
    if (ownedIds.includes(player.id) || bought || player.isPurchased) {
      setError('Player already owned or purchased');
      return;
    }
    if (localCoins < player.cost) {
      setError(`Insufficient Funds! You need ${player.cost} but have ${localCoins.toLocaleString()}`);
      return;
    }
    setBuying(true);
    setError('');
    try {
      await buyPlayer(userId, player, teamName);
      setLocalCoins(prev => prev - player.cost);
      setBought(player);
    } catch (e) {
      setError(typeof e === 'string' ? e : 'Purchase failed. Someone might have bought them first!');
    } finally {
      setBuying(false);
    }
  };

  if (bought) {
    return (
      <div className="card text-center p-12 phase-enter shadow-2xl border-t-8 border-t-[var(--vignan-gold)]">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Player Acquired!</h2>
        <div className="flex items-center gap-6 justify-center my-6 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
          <img src={bought.photoUrl || `https://ui-avatars.com/api/?name=${bought.name}`} alt="" className="w-20 h-20 rounded-full border-4 border-white shadow-lg" />
          <div className="text-left font-black uppercase tracking-tighter">
            <div className="text-xl leading-none">{bought.name}</div>
            <div className="text-[10px] text-gray-400 mt-1">{bought.team} • {bought.role}</div>
            <div className="text-amber-500 text-sm mt-1">⭐ {bought.stars}</div>
          </div>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 mb-6">
           <div className="text-[10px] font-bold uppercase text-gray-400">Remaining Balance</div>
           <div className="text-lg font-black text-[var(--vignan-blue)]">💰 {localCoins.toLocaleString()}</div>
        </div>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest animate-pulse">Waiting for Match Start...</p>
      </div>
    );
  }

  return (
    <div className="card p-6 phase-enter overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
           <div className="bg-[var(--vignan-blue)] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded w-fit mb-1">Live Auction</div>
           <h2 className="text-2xl font-black uppercase tracking-tighter">Available Players</h2>
        </div>
        <div className="bg-[var(--bg-secondary)] p-3 px-6 rounded-2xl flex items-center gap-3 border border-[var(--border)]">
           <span className="text-xs font-bold text-gray-400 uppercase">Budget:</span>
           <span className="text-lg font-black text-[var(--vignan-blue)]">💰 {localCoins.toLocaleString()}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700 text-xs font-black uppercase tracking-tight flex items-center gap-3">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} className="ml-auto">✕</button>
        </div>
      )}

      {players.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
           <div className="text-4xl mb-4 opacity-30">📂</div>
           <div className="text-xs font-bold uppercase tracking-widest">No players available in this round.</div>
        </div>
      ) : (
        [1, 2, 3].map(tier => {
          const tp = tierPlayers(tier).filter(p => !p.isPurchased);
          if (tp.length === 0) return null;
          
          const tierConfig = {
            1: { color: 'text-amber-500', bg: 'bg-amber-50', icon: '💎', label: 'Tier 1 • Elite' },
            2: { color: 'text-blue-500', bg: 'bg-blue-50', icon: '⚡', label: 'Tier 2 • Core' },
            3: { color: 'text-green-500', bg: 'bg-green-50', icon: '🌱', label: 'Tier 3 • Budget' }
          };
          const conf = tierConfig[tier];

          return (
            <div key={tier} className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <span className={`text-sm font-black uppercase tracking-tighter ${conf.color}`}>{conf.icon} {conf.label}</span>
                <div className="flex-1 h-[2px] bg-gray-100" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {tp.map(player => {
                  const ownedByYou = ownedIds.includes(player.id);
                  const canAfford = localCoins >= player.cost;
                  
                  return (
                    <div 
                      key={player.id}
                      className={`card p-4 flex items-center gap-4 border-2 transition-all group ${canAfford ? 'hover:border-[var(--vignan-blue)]' : 'opacity-60 border-red-50'}`}
                    >
                      <div className="relative">
                        <img src={player.photoUrl || `https://ui-avatars.com/api/?name=${player.name}`} className="w-14 h-14 rounded-full border-2 border-white shadow-md bg-gray-50" />
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm text-[8px] font-bold">R{player.roundNumber}</div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-black uppercase truncate tracking-tighter leading-none mb-1">{player.name}</div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase">{player.team} • {player.role}</div>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="text-[11px] font-black text-amber-600">💰 {player.cost}</span>
                           <span className="text-[10px] font-black text-gray-300">⭐ {player.stars}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBuy(player)}
                        disabled={buying || !!bought || !canAfford}
                        className={`p-2 px-4 rounded-xl text-[10px] font-black uppercase transition-all ${
                          canAfford 
                            ? 'bg-[var(--vignan-blue)] text-white hover:shadow-lg active:scale-95' 
                            : 'bg-red-50 text-red-400 cursor-not-allowed'
                        }`}
                      >
                        {buying ? '...' : canAfford ? 'Buy' : 'Low Funds'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
