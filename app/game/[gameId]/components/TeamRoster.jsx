'use client';

export default function TeamRoster({ players, coins, stars }) {
  return (
    <aside className="bg-[var(--vignan-blue)]/5 rounded-[40px] border border-[var(--vignan-blue)]/10 overflow-hidden flex flex-col max-h-[85vh] sticky top-24 shadow-sm backdrop-blur-md">
      <div className="p-8 border-b border-[var(--vignan-blue)]/10 text-center bg-white/50">
        <div className="text-xl font-black uppercase tracking-tighter mb-2">🏅 Your Squad</div>
        <div className="flex justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-[var(--vignan-blue)]">
           <span>🏏 {players.length}/13</span>
           <span className="text-amber-600">⭐ {stars?.toFixed(1) || 0}</span>
        </div>
      </div>
      <div className="overflow-y-auto flex-1 p-6 space-y-3 no-scrollbar max-h-[60vh] lg:max-h-[calc(85vh-160px)]">
        {players.length === 0 ? (
          <div className="text-center py-10 text-[var(--vignan-blue)]/40 text-[10px] font-black uppercase tracking-widest italic">
            Squad is empty...
          </div>
        ) : (
          players.map((p, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-[28px] border border-white bg-white/80 shadow-sm group hover:scale-[1.02] transition-transform">
              <div className="relative flex-shrink-0">
                 <img src={p.photoUrl || `https://ui-avatars.com/api/?name=${p.name}`} alt="" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                 <div className="absolute -top-1 -right-1 bg-[var(--vignan-blue)] text-white text-[8px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                    {i+1}
                 </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-black uppercase tracking-tighter truncate leading-none mb-1">{p.name}</div>
                <div className="flex items-center gap-2 mt-1.5">
                   <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-100">{p.role}</span>
                   <span className="text-[10px] font-black text-amber-500">⭐ {p.stars}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-8 bg-white border-t border-[var(--vignan-blue)]/10 text-center">
         <div className="text-[9px] font-black uppercase text-gray-400 mb-2">Available Budget</div>
         <div className="text-2xl font-black text-[var(--vignan-blue)] tracking-tighter leading-none">💰 {coins?.toLocaleString()}</div>
      </div>
    </aside>
  );
}
