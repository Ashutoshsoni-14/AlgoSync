import { useEffect, useState } from "react";
import { getProfile } from "../services/leaderboardService";
import Navbar from "../components/Navbar";
import { User, Mail, Award, Swords, CheckCircle2, XCircle, Calendar, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-550">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-xs font-semibold">Retrieving profile...</p>
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
                    <h3 className="text-sm font-bold text-zinc-300">Profile Loading Failed</h3>
                    <p className="text-zinc-550 text-xs mt-1">Please try logging in again.</p>
                </div>
            </div>
        );
    }

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

    const rating = profile.rating ?? 1200;
    const tier = getRankTier(rating);

    const totalBattles = profile.wins + profile.losses;
    const winRate = totalBattles > 0 ? Math.round((profile.wins / totalBattles) * 100) : 0;

    return (
        <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col gap-8 md:flex-row">
                
                {/* Left Card: Account Profile Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full md:w-1/3 bg-zinc-950/60 border border-zinc-800/80 rounded-2.5xl p-6 h-fit shadow-xl relative overflow-hidden flex flex-col items-center"
                >
                    {/* Glowing Accent */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-indigo-500/5 blur-3xl pointer-events-none" />

                    {/* Avatar Circle */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/15 mb-4">
                        <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center font-extrabold text-2xl text-zinc-150 uppercase font-mono">
                            {profile.name ? profile.name.substring(0, 2) : "CD"}
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-zinc-150 text-center truncate w-full">{profile.name}</h2>
                    
                    <div className="flex items-center gap-1.5 text-xs text-zinc-550 font-medium mt-1">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">{profile.email}</span>
                    </div>

                    {/* Divider */}
                    <div className="w-full border-t border-zinc-900 my-5" />

                    {/* Skill Rating Tier */}
                    <div className="w-full flex flex-col gap-4">
                        <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <Award className="w-5 h-5 text-amber-500" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-zinc-500 font-semibold uppercase leading-none">Elo Rating</span>
                                    <span className="text-sm font-bold font-mono text-zinc-200 mt-1">{rating}</span>
                                </div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${tier.color}`}>
                                {tier.name}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Right Card: Statistics and Battle Logs */}
                <div className="flex-1 flex flex-col gap-6">
                    
                    {/* Performance metrics grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        {/* Box 1 */}
                        <div className="bg-zinc-950/60 border border-zinc-800/80 p-4.5 rounded-2xl shadow-xl flex flex-col">
                            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider leading-none">Battles Done</span>
                            <span className="text-2xl font-extrabold font-mono text-zinc-250 mt-2 flex items-center gap-2">
                                <Swords className="w-5 h-5 text-indigo-400" />
                                {totalBattles}
                            </span>
                        </div>

                        {/* Box 2 */}
                        <div className="bg-zinc-950/60 border border-zinc-800/80 p-4.5 rounded-2xl shadow-xl flex flex-col">
                            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider leading-none">Victories</span>
                            <span className="text-2xl font-extrabold font-mono text-emerald-400 mt-2 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" />
                                {profile.wins}
                            </span>
                        </div>

                        {/* Box 3 */}
                        <div className="bg-zinc-950/60 border border-zinc-800/80 p-4.5 rounded-2xl shadow-xl flex flex-col">
                            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider leading-none">Defeats</span>
                            <span className="text-2xl font-extrabold font-mono text-rose-455 mt-2 flex items-center gap-2">
                                <XCircle className="w-5 h-5" />
                                {profile.losses}
                            </span>
                        </div>

                        {/* Box 4 */}
                        <div className="bg-zinc-950/60 border border-zinc-800/80 p-4.5 rounded-2xl shadow-xl flex flex-col">
                            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider leading-none">Win Ratio</span>
                            <span className="text-2xl font-extrabold font-mono text-zinc-200 mt-2 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-400" />
                                {winRate}%
                            </span>
                        </div>
                    </motion.div>

                    {/* Battle Logs Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="bg-zinc-950/40 border border-zinc-850 rounded-2.5xl p-6 flex flex-col flex-1"
                    >
                        <h3 className="text-sm font-bold text-zinc-200 mb-4.5 flex items-center gap-2 uppercase tracking-wider">
                            <Calendar className="w-4.5 h-4.5 text-indigo-400" />
                            Match Logs & Rating Progress
                        </h3>

                        {profile.battleHistory.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-zinc-850 rounded-2xl text-center text-zinc-550">
                                <Swords className="w-8 h-8 text-zinc-800 mb-2" />
                                <p className="text-xs font-semibold">No recorded battles found</p>
                                <p className="text-[10px] mt-0.5">Provision an arena room to start dueling.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                {[...profile.battleHistory].reverse().map((battle) => {
                                    // Identify verdict: did the current user win this battle?
                                    const isWinner = battle.winner === profile._id;
                                    const formattedDate = new Date(battle.createdAt || battle.startTime).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric"
                                    });

                                    // Find rating change for current user
                                    const partObj = battle.participants?.find(p => p.user?.toString() === profile._id.toString());
                                    const ratingDiff = partObj?.ratingChange ?? 0;

                                    return (
                                        <div
                                            key={battle._id}
                                            className="p-3.5 bg-zinc-950/60 border border-zinc-900 rounded-xl hover:border-zinc-800/80 flex items-center justify-between transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                {isWinner ? (
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-450">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-450">
                                                        <XCircle className="w-4 h-4" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-zinc-300">
                                                        {isWinner ? "Match Won" : "Match Lost"}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-550 font-mono mt-0.5">
                                                        Arena ID: {battle.room || battle._id}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Rating change display */}
                                            <div className="flex items-center gap-2">
                                                {ratingDiff !== 0 && (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 font-mono ${ratingDiff > 0 ? "text-emerald-400 bg-emerald-500/5 border border-emerald-500/20" : "text-rose-400 bg-rose-500/5 border border-rose-500/20"}`}>
                                                        <TrendingUp className={`w-3.5 h-3.5 ${ratingDiff < 0 ? "rotate-180" : ""}`} />
                                                        {ratingDiff > 0 ? `+${ratingDiff}` : ratingDiff}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-zinc-550 font-semibold bg-zinc-900 border border-zinc-800/60 px-2 py-0.5 rounded-md">
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