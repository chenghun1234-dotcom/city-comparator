'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Plane, Loader2, Thermometer, Wifi, Shield, DollarSign, Star, Code, Copy, Check } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function Home() {
  const [city1, setCity1] = useState('ICN');
  const [city2, setCity2] = useState('BKK');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchComparison = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    setError(null);
    
    try {
      const url = `/api/v1/compare?city1=${city1.trim()}&city2=${city2.trim()}`;
      const res = await fetch(url, { cache: 'no-store' });
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.message || 'Service Unavailable');
      setData(result);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center py-12 px-4 md:px-8">
      <div className="mesh-bg" />
      
      {/* Header Section */}
      <header className="max-w-4xl w-full text-center mb-16 animate-fade-in">
        <div className="inline-block px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-6 backdrop-blur-sm">
          Monetized RapidAPI Engine v1.1
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
          Nomad<span className="text-sky-500 text-glow">Score</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto leading-relaxed font-medium uppercase tracking-[0.3em] opacity-80 font-display">
          Global Quality of Life & Logistics Analyzer
        </p>
      </header>

      {/* Control Panel */}
      <div className="w-full max-w-2xl glass-card rounded-[2.5rem] p-8 md:p-12 mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <form onSubmit={fetchComparison} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Base Origin</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-500 group-focus-within:scale-110 transition-transform" />
                <input 
                  type="text"
                  value={city1}
                  onChange={(e) => setCity1(e.target.value.toUpperCase().slice(0, 3))}
                  className="w-full glass-input rounded-2xl py-4 pl-12 pr-4 text-white font-mono text-lg focus:outline-none"
                  placeholder="ICN"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Target Destination</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 group-focus-within:scale-110 transition-transform" />
                <input 
                  type="text"
                  value={city2}
                  onChange={(e) => setCity2(e.target.value.toUpperCase().slice(0, 3))}
                  className="w-full glass-input rounded-2xl py-4 pl-12 pr-4 text-white font-mono text-lg focus:outline-none"
                  placeholder="BKK"
                />
              </div>
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full premium-gradient hover:opacity-90 disabled:opacity-50 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-sky-500/20"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
            <span className="uppercase tracking-[0.2em] text-xs">Run Comparison Engine</span>
          </button>
        </form>
        
        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold text-center uppercase tracking-widest">
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {data && data.data && (
        <div className="w-full max-w-5xl space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[data.data.city1, data.data.city2].map((raw, i) => (
              <CityCard key={i} data={raw} isPrimary={i === 0} />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Logic/Reasoning */}
            <div className="md:col-span-2 glass-card p-8 rounded-3xl border-sky-500/10 flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center shrink-0">
                <Star className="text-sky-500 w-6 h-6 fill-current" />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em] mb-1">Expert Recommendation</h4>
                <p className="text-sm text-slate-300 font-medium leading-relaxed">
                  Best choice: <span className="text-white font-bold">{data.summary.recommended_city}</span>. {data.summary.reason}
                </p>
              </div>
            </div>

            {/* Travel CTA */}
            <a 
              href={data.data.travel.booking_link || '#'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="glass-card p-8 rounded-3xl border-indigo-500/10 hover:bg-white/[0.05] transition-all group flex flex-col justify-center"
            >
              <div className="flex items-center justify-between mb-2">
                <Plane className="text-indigo-400 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                <span className="text-2xl font-black text-white">${data.data.travel.min_price}</span>
              </div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">
                Book Best Route (Aviasales)
              </p>
            </a>
          </div>

          {/* Dev Tools */}
          <div className="pt-12 flex flex-col items-center">
            <button 
              onClick={() => setDevMode(!devMode)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-[10px] font-black text-slate-500 uppercase tracking-widest"
            >
              <Code className="w-3.5 h-3.5" />
              {devMode ? 'Hide Response' : 'Inspect API JSON'}
            </button>
            
            {devMode && (
              <div className="w-full mt-6 relative animate-fade-in">
                <button 
                  onClick={copyJson}
                  className="absolute right-4 top-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <div className="glass-card rounded-[2rem] p-8 overflow-hidden">
                  <pre className="text-xs font-mono text-sky-300/80 overflow-x-auto custom-scrollbar">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="mt-24 pb-12 text-center opacity-20 hover:opacity-40 transition-opacity">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.6em]">
          Engineered for Latency • Secured for Profit • Built with Next.js 15
        </p>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(56, 189, 248, 0.4); }
      `}</style>
    </main>
  );
}

function CityCard({ data, isPrimary }: { data: any, isPrimary: boolean }) {
  const stats = [
    { label: 'Internet', val: data.metrics['Internet Access'] || 5, icon: Wifi, color: 'text-sky-400' },
    { label: 'Cost', val: data.metrics['Cost of Living'] || 5, icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Safety', val: data.metrics['Safety'] || 5, icon: Shield, color: 'text-rose-400' },
  ];

  return (
    <div className="glass-card p-10 rounded-[2.5rem] flex flex-col relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 ${isPrimary ? 'bg-sky-500' : 'bg-indigo-500'}`} />
      
      <div className="flex justify-between items-start mb-10 relative z-10">
        <div>
          <h3 className="text-3xl font-black text-white mb-2 group-hover:translate-x-1 transition-transform">{data.info.name}</h3>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono text-slate-500 font-bold uppercase tracking-widest border border-white/5">
              {data.info.code}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-5xl font-black tabular-nums transition-colors ${isPrimary ? 'text-sky-400' : 'text-indigo-400'}`}>
            {data.info.nomad_score}
          </div>
          <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mt-1">Score</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-white/[0.03] border border-white/[0.05] p-6 rounded-3xl group/item hover:bg-white/[0.06] transition-colors overflow-hidden relative">
          <Thermometer className="w-4 h-4 text-sky-400 mb-3" />
          <div className="text-2xl font-black text-white">{data.weather?.temperature || 'N/A'}°C</div>
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Current Weather</p>
        </div>
        <a href={data.lodging.link} target="_blank" rel="noopener noreferrer" className="bg-white/[0.03] border border-white/[0.05] p-6 rounded-3xl group/item hover:bg-white/[0.08] transition-colors relative block">
          <DollarSign className="w-4 h-4 text-emerald-400 mb-3" />
          <div className="text-2xl font-black text-white">${data.lodging.price}</div>
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1 underline pointer-events-none">Avg Nightly Stay</p>
        </a>
      </div>

      <div className="space-y-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="space-y-2.5">
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                <stat.icon className={`w-3 h-3 ${stat.color} opacity-70`} />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400 font-bold">{stat.val.toFixed(1)}/10</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-out delay-${idx * 200} ${idx === 0 ? 'bg-sky-500' : idx === 1 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ width: `${stat.val * 10}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
