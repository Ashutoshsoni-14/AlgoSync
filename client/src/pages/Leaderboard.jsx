import { useEffect, useState } from "react";
import { getLeaderboard } from "../services/leaderboardService";
import Navbar from "../components/Navbar";
import { Trophy, Award, Medal, Activity, Sparkles, Swords, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

function Leaderboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await getLeaderboard();
                setUsers(data);
            } catch (err) {
                console.log("Error loading leaderboard", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    // Codeforces-style rank tier helper
    const getRankTier = (r) => {
        if (r <= 1200) return { name: "Newbie", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" };
        if (r <= 1400) return { name: "Pupil", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
        if (r <= 1600) return { name: "Specialist", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" };
        if (r <= 1900) return { name: "Expert", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
        if (r <= 2100) return { name: "Candidate Master", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" };
        if (r <= 2300) return { name: "Master", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
        return { name: "Grandmaster", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    };

    // Split users into Top 3 and remaining
    const top3 = users.slice(0, 3);
    const rest = users.slice(3);

    // Helper for winrate calculation
    const getWinRate = (w, l) => {
        const total = w + l;
        if (total === 0) return 0;
        return Math.round((w / total) * 100);
    };

    return (
        <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col">
                {/* Header */}
                <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight flex items-center justify-center md:justify-start gap-2.5">
                            Leaderboard
                            <Trophy className="w-7 h-7 text-amber-400" />
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1.5 font-medium">
                            The elite coders of the AlgoSync ecosystem. Do battles to rise in ranks.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-xs font-semibold">Updating ranks...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center border border-zinc-800/80 bg-zinc-950/20 p-12 rounded-2xl text-center">
                        <ShieldAlert className="w-10 h-10 text-zinc-650 mb-3" />
                        <h3 className="text-sm font-bold text-zinc-300">No ranks loaded</h3>
                        <p className="text-zinc-500 text-xs mt-1 font-medium">Be the first to challenge other players and settle the score!</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Top 3 Podium Row */}
                        {top3.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
                                
                                {/* 2nd Place (Left on desktop) */}
                                {top3[1] && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                        className="order-2 md:order-1 bg-zinc-950/60 border border-zinc-800/80 rounded-2.5xl p-6 flex flex-col items-center text-center shadow-xl relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 inset-x-0 h-1 bg-zinc-400/30" />
                                        <Medal className="w-10 h-10 text-zinc-400 mb-3 drop-shadow-[0_0_10px_rgba(161,161,170,0.15)]" />
                                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Rank #2</span>
                                        <h3 className="text-base font-bold text-zinc-200 mt-2 truncate w-full">{top3[1].name}</h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border ${getRankTier(top3[1].rating).color}`}>
                                                {getRankTier(top3[1].rating).name}
                                            </span>
                                            <span className="text-xs font-mono font-bold text-zinc-400">{top3[1].rating}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 border-t border-zinc-900 w-full mt-5 pt-4 text-xs font-semibold">
                                            <div className="text-zinc-500">Wins: <span className="text-emerald-400">{top3[1].wins}</span></div>
                                            <div className="text-zinc-500">Win Rate: <span className="text-indigo-400">{getWinRate(top3[1].wins, top3[1].losses)}%</span></div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* 1st Place (Center on desktop) */}
                                {top3[0] && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="order-1 md:order-2 bg-gradient-to-b from-zinc-900 to-zinc-950/90 border border-amber-500/20 rounded-2.5xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden glow-orange -translate-y-2"
                                    >
                                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-rose-500" />
                                        <Trophy className="w-12 h-12 text-amber-400 mb-3 drop-shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-bounce" />
                                        <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Champion Rank #1</span>
                                        <h3 className="text-lg font-extrabold text-zinc-100 mt-2 truncate w-full flex items-center justify-center gap-1.5">
                                            {top3[0].name}
                                            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border ${getRankTier(top3[0].rating).color}`}>
                                                {getRankTier(top3[0].rating).name}
                                            </span>
                                            <span className="text-xs font-mono font-bold text-zinc-300">{top3[0].rating}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 border-t border-zinc-900 w-full mt-6 pt-5 text-xs font-semibold">
                                            <div className="text-zinc-500">Wins: <span className="text-emerald-450 font-bold">{top3[0].wins}</span></div>
                                            <div className="text-zinc-500">Win Rate: <span className="text-indigo-400 font-bold">{getWinRate(top3[0].wins, top3[0].losses)}%</span></div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* 3rd Place (Right on desktop) */}
                                {top3[2] && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        className="order-3 bg-zinc-950/60 border border-zinc-800/80 rounded-2.5xl p-6 flex flex-col items-center text-center shadow-xl relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 inset-x-0 h-1 bg-amber-700/30" />
                                        <Medal className="w-10 h-10 text-amber-700 mb-3 drop-shadow-[0_0_10px_rgba(180,83,9,0.15)]" />
                                        <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Rank #3</span>
                                        <h3 className="text-base font-bold text-zinc-200 mt-2 truncate w-full">{top3[2].name}</h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border ${getRankTier(top3[2].rating).color}`}>
                                                {getRankTier(top3[2].rating).name}
                                            </span>
                                            <span className="text-xs font-mono font-bold text-zinc-400">{top3[2].rating}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 border-t border-zinc-900 w-full mt-5 pt-4 text-xs font-semibold">
                                            <div className="text-zinc-500">Wins: <span className="text-emerald-400">{top3[2].wins}</span></div>
                                            <div className="text-zinc-500">Win Rate: <span className="text-indigo-400">{getWinRate(top3[2].wins, top3[2].losses)}%</span></div>
                                        </div>
                                    </motion.div>
                                )}

                            </div>
                        )}

                        {/* Leaderboard Table for the rest */}
                        {rest.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl"
                            >
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-zinc-900 text-zinc-500 text-[10px] font-bold uppercase tracking-wider bg-zinc-950/80">
                                                <th className="py-4.5 px-6">Rank</th>
                                                <th className="py-4.5 px-6">Coder</th>
                                                <th className="py-4.5 px-6">Tier</th>
                                                <th className="py-4.5 px-6 text-center">Rating</th>
                                                <th className="py-4.5 px-6 text-center">Wins / Losses</th>
                                                <th className="py-4.5 px-6 text-center">Win Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-900/60 text-sm font-semibold">
                                            {rest.map((user, idx) => {
                                                const rankNum = idx + 4;
                                                const tier = getRankTier(user.rating);
                                                const wr = getWinRate(user.wins, user.losses);
                                                return (
                                                    <tr key={user._id} className="hover:bg-zinc-900/30 transition-colors">
                                                        <td className="py-4 px-6 text-zinc-500 font-mono text-xs font-bold">
                                                            #{rankNum}
                                                        </td>
                                                        <td className="py-4 px-6 text-zinc-200">
                                                            {user.name}
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${tier.color}`}>
                                                                {tier.name}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-center font-mono text-zinc-350 font-bold">
                                                            {user.rating}
                                                        </td>
                                                        <td className="py-4 px-6 text-center font-mono text-xs text-zinc-500">
                                                            <span className="text-emerald-450">{user.wins}</span>
                                                            <span className="mx-1">/</span>
                                                            <span className="text-rose-450">{user.losses}</span>
                                                        </td>
                                                        <td className="py-4 px-6 text-center font-mono text-xs">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <span className="text-indigo-400 font-bold">{wr}%</span>
                                                                <div className="w-12 h-1.5 bg-zinc-900 rounded-full overflow-hidden hidden sm:block">
                                                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${wr}%` }} />
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Leaderboard;