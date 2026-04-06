'use client';

export default function PlayerMarket({ players, ownedIds }) {
  const tiers = [1, 2, 3];
  const tierNames = { 1: '🏆 Tier 1', 2: '🔹 Tier 2', 3: '🌱 Tier 3' };

  return (
    <aside className="bg-white rounded-3xl border border-[var(--border)] overflow-hidden flex flex-col max-h-[85vh] sticky top-24 shadow-sm">
      <div className="p-5 border-b border-[var(--border)] bg-gray-50/50">
        <div className="text-sm font-black uppercase tracking-tighter">🏏 Player Market</div>
        <div className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">Round Pool available</div>
      </div>
      <div className="overflow-y-auto flex-1 p-3 space-y-6 no-scrollbar">
        {players.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs font-bold uppercase italic">
            Waiting for Round...
          </div>
        ) : (
          tiers.map(tier => {
            const tp = players.filter(p => p.tier === tier);
            if (!tp.length) return null;
            return (
              <div key={tier}>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-300 ml-2 mb-3">
                  {tierNames[tier]}
                </div>
                <div className="space-y-2">
                  {tp.map(p => {
                    const owned = ownedIds.includes(p.id);
                    return (
                      <div key={p.id} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                        owned ? 'bg-green-50/50 border-green-100 opacity-60' : 'bg-gray-50 border-transparent hover:border-gray-200'
                      }`}>
                        <div className="relative flex-shrink-0">
                           <img src={p.photoUrl || `https://ui-avatars.com/api/?name=${p.name}`} alt="" className="w-10 h-10 rounded-full bg-white shadow-sm" />
                           {owned && <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">✓</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-black uppercase truncate leading-none mb-1">{p.name}</div>
                          <div className="text-[9px] font-bold text-gray-400 uppercase">{p.team}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                           <div className="text-[10px] font-black text-[var(--vignan-blue)] leading-none">💰 {p.cost}</div>
                           <div className="text-[9px] font-bold text-amber-500 mt-1">⭐ {p.stars}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
