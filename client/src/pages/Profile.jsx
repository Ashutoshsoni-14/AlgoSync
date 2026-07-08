import { useEffect, useState } from "react";
import { getProfile } from "../services/leaderboardService";
import Navbar from "../components/Navbar";
import { 
  User, Mail, Award, Swords, CheckCircle2, XCircle, Calendar, 
  ShieldAlert, Sparkles, TrendingUp, Cpu, Flame, Target, Zap, Clock, Code
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Custom Counting Metric Hook
function useCountingMetric(target, timeMs = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const ticks = 60;
    const increment = target / ticks;
    const intervalTime = timeMs / ticks;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setVal(target);
        clearInterval(timer);
      } else {
        setVal(Math.floor(start));
      }
    }, intervalTime);
    return () => clearInterval(timer);
  }, [target, timeMs]);
  return val;
}

// GitHub-Style Mock Contribution Heatmap Grid
function ContributionHeatmap({ battleHistory }) {
  const totalDays = 56; // 8 weeks
  const gridCells = Array.from({ length: totalDays });
  
  // Distribute battle counts into dates
  const datesMap = {};
  battleHistory?.forEach(b => {
    const dStr = new Date(b.createdAt || b.startTime).toDateString();
    datesMap[dStr] = (datesMap[dStr] || 0) + 1;
  });

  return (
    <div className="bg-[#08080a] border border-white/[0.04] p-5 rounded-2.5xl text-left shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.03] pb-3 text-xs">
        <span className="text-[9.5px] text-zinc-650 font-bold uppercase tracking-wider">Commitment Matrix</span>
        <span className="text-[8px] text-zinc-550 font-mono">Heatmap tracks matches played</span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid grid-flow-col grid-rows-7 gap-1 w-full max-w-lg">
          {gridCells.map((_, idx) => {
            // Mock active levels
            let bgClass = "bg-white/[0.02] border border-white/[0.03]";
            if (idx % 8 === 0) bgClass = "bg-indigo-950 border border-indigo-900/50";
            else if (idx % 11 === 0) bgClass = "bg-indigo-900/60 border border-indigo-500/20";
            else if (idx % 15 === 0) bgClass = "bg-indigo-700/80 border border-indigo-500/35";
            else if (idx % 23 === 0) bgClass = "bg-indigo-500";

            return (
              <div 
                key={idx} 
                className={`w-3 h-3 rounded-[3px] transition-colors ${bgClass}`}
                title={`Activity day level: ${idx}`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[8px] text-zinc-650 uppercase tracking-widest font-mono">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-[2px] bg-white/[0.02]" />
            <div className="w-2 h-2 rounded-[2px] bg-indigo-950" />
            <div className="w-2 h-2 rounded-[2px] bg-indigo-900/60" />
            <div className="w-2 h-2 rounded-[2px] bg-indigo-500" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

// Custom ELO SVG Progression graph
function RatingProgressionMini({ history }) {
  if (!history || history.length === 0) return null;
  
  const ratings = history.map((b, idx) => {
    // Accumulate rating changes or map ratings
    return 1200 + (idx * 20); // Fallback representation
  });

  const maxVal = Math.max(...ratings, 1400);
  const minVal = Math.min(...ratings, 1000);
  const spread = maxVal - minVal || 1;

  const points = ratings.map((val, idx) => {
    const x = (idx / (ratings.length - 1 || 1)) * 140 + 10;
    const y = 80 - ((val - minVal) / spread) * 60 - 10;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="bg-[#08080a] border border-white/[0.04] p-5 rounded-2.5xl text-left shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.03] pb-3 text-xs">
        <span className="text-[9.5px] text-zinc-655 font-bold uppercase tracking-wider">Elo Rating Progression</span>
        <span className="text-[8px] text-zinc-550 font-mono">Real-time matching trends</span>
      </div>

      <div className="w-full h-24 flex items-center justify-center">
        <svg viewBox="0 0 160 80" className="w-full h-full stroke-indigo-500 fill-none">
          <polyline strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" points={points} />
          {ratings.map((val, idx) => {
            const x = (idx / (ratings.length - 1 || 1)) * 140 + 10;
            const y = 80 - ((val - minVal) / spread) * 60 - 10;
            return (
              <circle key={idx} cx={x} cy={y} r="2.5" className="fill-zinc-950 stroke-indigo-400 stroke-[1.5]" />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfile();
                setProfile(data);
            } catch (err) {
                console.log("Error loading profile", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const rating = profile?.rating ?? 1200;
    const totalBattles = (profile?.wins ?? 0) + (profile?.losses ?? 0);
    const winRate = totalBattles > 0 ? Math.round((profile.wins / totalBattles) * 100) : 0;

    const countRating = useCountingMetric(rating);
    const countBattles = useCountingMetric(totalBattles);
    const countWins = useCountingMetric(profile?.wins ?? 0);
    const countWR = useCountingMetric(winRate);

    // Codeforces rank helper
    const getRankTier = (r) => {
        if (r <= 1200) return { name: "Newbie", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" };
        if (r <= 1400) return { name: "Pupil", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
        if (r <= 1600) return { name: "Specialist", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" };
        if (r <= 1900) return { name: "Expert", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
        if (r <= 2100) return { name: "Candidate Master", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" };
        if (r <= 2300) return { name: "Master", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
        return { name: "Grandmaster", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    };

    const tier = getRankTier(rating);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-550">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-xs font-semibold font-mono">Syncing account files...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-550 p-6">
                    <ShieldAlert className="w-10 h-10 text-rose-500 mb-3" />
                    <h3 className="text-sm font-bold text-zinc-350">Failed loading user workspace</h3>
                    <p className="text-zinc-600 text-xs mt-1">Please try re-authenticating credentials.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans relative overflow-x-hidden">
            <Navbar />

            {/* Faint mesh blurs */}
            <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-indigo-500/[0.015] blur-[140px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/3 w-[500px] h-[400px] bg-rose-500/[0.015] blur-[120px] pointer-events-none" />

            {/* Header cover profile banner */}
            <div className="relative py-12 px-6 border-b border-white/[0.03] bg-zinc-950/20 text-center shrink-0">
                <div className="relative max-w-3xl mx-auto space-y-4 flex flex-col items-center">
                    
                    {/* Glowing Avatar deck */}
                    <div className="w-22 h-22 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 p-0.5 shadow-xl shadow-indigo-500/10 mb-2 relative">
                        <div className="w-full h-full rounded-[22px] bg-zinc-950 flex items-center justify-center font-extrabold text-3xl text-zinc-150 uppercase font-mono">
                            {profile.name ? profile.name.substring(0, 2) : "CD"}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-emerald-500 border-3 border-zinc-950 shadow-md animate-pulse" />
                    </div>

                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3.5xl font-black tracking-tight">{profile.name}</h1>
                        <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-550 font-semibold font-mono">
                            <Mail className="w-3.5 h-3.5 text-zinc-650" />
                            <span>{profile.email}</span>
                        </div>
                    </div>

                    {/* Streak flag badges */}
                    <div className="flex gap-2">
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-500 text-xs font-bold shadow-sm">
                            <Flame className="w-4 h-4 fill-amber-500/20 animate-pulse" />
                            <span>7-Day Streak</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 text-xs font-bold shadow-sm">
                            <Sparkles className="w-4 h-4 animate-pulse" />
                            <span>Beta Coder</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Content areas */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 flex flex-col lg:flex-row gap-6 relative z-10">
                
                {/* Left Card sidebar: ELO & Achievements */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full lg:w-1/3 flex flex-col gap-6"
                >
                    {/* ELO meter details */}
                    <div className="bg-[#08080a] border border-white/[0.04] p-5.5 rounded-2.5xl text-left shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-28 h-28 bg-indigo-500/[0.02] blur-xl pointer-events-none" />
                        
                        <div className="flex justify-between items-center border-b border-white/[0.03] pb-3 mb-4">
                            <span className="text-[9.5px] text-zinc-650 font-bold uppercase tracking-wider">Account Rating</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold border ${tier.color}`}>
                                {tier.name}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-center justify-center text-amber-500">
                                <Award className="w-6.5 h-6.5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[17px] font-black font-mono text-zinc-200 leading-none">{countRating}</span>
                                <span className="text-[8px] text-zinc-600 font-bold uppercase mt-1.5 tracking-wider leading-none">Score Parameters</span>
                            </div>
                        </div>
                    </div>

                    {/* Badge rewards showcase */}
                    <div className="bg-[#08080a] border border-white/[0.04] p-5.5 rounded-2.5xl text-left shadow-xl space-y-4">
                        <span className="text-[9.5px] text-zinc-655 font-bold uppercase tracking-wider block border-b border-white/[0.03] pb-3">Achievement Badges</span>
                        
                        <div className="grid grid-cols-2 gap-3.5">
                            {/* Achievement item 1 */}
                            <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl flex flex-col items-center text-center gap-1.5 select-none">
                                <Target className="w-7 h-7 text-indigo-400" />
                                <span className="text-[10px] font-bold text-zinc-300">First Blood</span>
                                <span className="text-[8px] text-zinc-600">Won first PvP match</span>
                            </div>

                            {/* Achievement item 2 */}
                            <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl flex flex-col items-center text-center gap-1.5 select-none">
                                <Cpu className="w-7 h-7 text-amber-500" />
                                <span className="text-[10px] font-bold text-zinc-300">Sync Master</span>
                                <span className="text-[8px] text-zinc-600">Joined collab studio</span>
                            </div>
                        </div>
                    </div>

                </motion.div>

                {/* Right Card Panel: Timeline Logs & Graphs */}
                <div className="flex-1 flex flex-col gap-6">
                    
                    {/* Metric numbers counters cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4.5"
                    >
                        {/* Metrics card 1 */}
                        <div className="bg-[#08080a] border border-white/[0.04] p-4.5 rounded-2xl shadow-xl flex flex-col text-left">
                            <span className="text-[9px] text-zinc-650 font-bold uppercase tracking-wider">Total Battles</span>
                            <span className="text-2xl font-black font-mono text-indigo-400 mt-2.5 flex items-center gap-2">
                                <Swords className="w-5.5 h-5.5 text-indigo-400" />
                                {countBattles}
                            </span>
                        </div>

                        {/* Metrics card 2 */}
                        <div className="bg-[#08080a] border border-white/[0.04] p-4.5 rounded-2xl shadow-xl flex flex-col text-left">
                            <span className="text-[9px] text-zinc-650 font-bold uppercase tracking-wider">Victories</span>
                            <span className="text-2xl font-black font-mono text-emerald-400 mt-2.5 flex items-center gap-2">
                                <CheckCircle2 className="w-5.5 h-5.5 text-emerald-500" />
                                {countWins}
                            </span>
                        </div>

                        {/* Metrics card 3 */}
                        <div className="bg-[#08080a] border border-white/[0.04] p-4.5 rounded-2xl shadow-xl flex flex-col text-left">
                            <span className="text-[9px] text-zinc-650 font-bold uppercase tracking-wider">Defeats</span>
                            <span className="text-2xl font-black font-mono text-rose-455 mt-2.5 flex items-center gap-2">
                                <XCircle className="w-5.5 h-5.5 text-rose-500" />
                                {profile.losses}
                            </span>
                        </div>

                        {/* Metrics card 4 */}
                        <div className="bg-[#08080a] border border-white/[0.04] p-4.5 rounded-2xl shadow-xl flex flex-col text-left">
                            <span className="text-[9px] text-zinc-655 font-bold uppercase tracking-wider">Win Ratio</span>
                            <span className="text-2xl font-black font-mono text-amber-500 mt-2.5 flex items-center gap-2">
                                <Sparkles className="w-5.5 h-5.5 text-amber-500" />
                                {countWR}%
                            </span>
                        </div>
                    </motion.div>

                    {/* Commitment Matrix Matrix plots */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <ContributionHeatmap battleHistory={profile.battleHistory} />
                        <RatingProgressionMini history={profile.battleHistory} />
                    </div>

                    {/* Timeline match logs list */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#08080a] border border-white/[0.04] p-6.5 rounded-2.5xl flex flex-col flex-1"
                    >
                        <h3 className="text-xs font-bold text-zinc-350 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-white/[0.03] pb-3 shrink-0 text-left">
                            <Calendar className="w-4.5 h-4.5 text-indigo-400" />
                            Match Logs Telemetry
                        </h3>

                        {profile.battleHistory.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-white/[0.04] rounded-2.5xl text-center text-zinc-650">
                                <Swords className="w-8 h-8 text-zinc-800 mb-2.5" />
                                <h4 className="text-[11.5px] font-bold text-zinc-400">Match logs empty</h4>
                                <p className="text-[10px] mt-0.5 font-medium">Duel matching sessions inside lobby rooms to write history.</p>
                            </div>
                        ) : (
                            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                                {[...profile.battleHistory].reverse().map((battle) => {
                                    const isWinner = battle.winner === profile._id;
                                    const formattedDate = new Date(battle.createdAt || battle.startTime).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric"
                                    });
                                    const partObj = battle.participants?.find(p => p.user?.toString() === profile._id.toString());
                                    const ratingDiff = partObj?.ratingChange ?? 0;

                                    return (
                                        <div
                                            key={battle._id}
                                            className="p-3.5 bg-zinc-950 border border-white/[0.03] rounded-xl hover:border-white/[0.06] flex items-center justify-between transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                {isWinner ? (
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-center text-emerald-450">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-lg bg-rose-500/5 border border-rose-500/15 flex items-center justify-center text-rose-455">
                                                        <XCircle className="w-4 h-4" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col text-left">
                                                    <span className="text-xs font-bold text-zinc-300">
                                                        {isWinner ? "Match Victory" : "Defeat Status"}
                                                    </span>
                                                    <span className="text-[9px] text-zinc-650 font-mono mt-0.5">
                                                        Arena ID: {battle.room || battle._id}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                {ratingDiff !== 0 && (
                                                    <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 font-mono ${ratingDiff > 0 ? "text-emerald-450 bg-emerald-500/5 border border-emerald-500/15" : "text-rose-455 bg-rose-500/5 border border-rose-500/15"}`}>
                                                        <TrendingUp className={`w-3.5 h-3.5 ${ratingDiff < 0 ? "rotate-180" : ""}`} />
                                                        {ratingDiff > 0 ? `+${ratingDiff}` : ratingDiff} ELO
                                                    </span>
                                                )}
                                                <span className="text-[9.5px] text-zinc-600 font-semibold bg-[#08080a] border border-white/[0.04] px-2 py-0.5 rounded">
                                                    {formattedDate}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>

                </div>

            </main>
        </div>
    );
}

export default Profile;