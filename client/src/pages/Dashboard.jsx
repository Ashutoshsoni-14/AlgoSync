import { useState, useEffect } from "react";
import { createRoom, joinRoom } from "../services/roomService";
import { getProfile } from "../services/leaderboardService";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { 
  Swords, PlusCircle, LogIn, Sparkles, Award, BookOpen, 
  AlertCircle, Eye, Users, Trophy, ChevronRight, Activity, Users2, Library
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Dashboard() {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState("");
    const [difficulty, setDifficulty] = useState("Random");
    const [errorMsg, setErrorMsg] = useState("");
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [loadingJoin, setLoadingJoin] = useState(false);
    const [profile, setProfile] = useState(null);

    // Fetch latest user profile to ensure ELO rating is up to date
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const data = await getProfile();
                setProfile(data);
                // Keep local storage synchronized
                const localUser = JSON.parse(localStorage.getItem("user")) || {};
                localStorage.setItem("user", JSON.stringify({ ...localUser, ...data }));
            } catch (err) {
                console.log("Error loading latest profile details:", err);
            }
        };
        fetchProfileData();
    }, []);

    // Codeforces-style rank tier helper
    const getRankTier = (r) => {
        if (r <= 1200) return { name: "Newbie", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30" };
        if (r <= 1400) return { name: "Pupil", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
        if (r <= 1600) return { name: "Specialist", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" };
        if (r <= 1900) return { name: "Expert", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" };
        if (r <= 2100) return { name: "Candidate Master", color: "text-violet-400 bg-violet-500/10 border-violet-500/30" };
        if (r <= 2300) return { name: "Master", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
        return { name: "Grandmaster", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" };
    };

    const rating = profile?.rating ?? 1200;
    const tier = getRankTier(rating);
    const totalBattles = (profile?.wins ?? 0) + (profile?.losses ?? 0);
    const winRate = totalBattles > 0 ? Math.round((profile.wins / totalBattles) * 100) : 0;

    const handleCreateBattleRoom = async () => {
        setErrorMsg("");
        setLoadingCreate(true);
        try {
            const room = await createRoom({
                difficulty,
                roomType: "battle"
            });
            navigate(`/room/${room.roomId}`);
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to create battle room.";
            setErrorMsg(msg);
        } finally {
            setLoadingCreate(false);
        }
    };

    const handleJoinRoom = async (asSpectator = false) => {
        if (!roomId.trim()) {
            setErrorMsg("Please enter a valid Room ID to proceed.");
            return;
        }
        setErrorMsg("");
        setLoadingJoin(true);
        try {
            if (asSpectator) {
                navigate(`/room/${roomId}?spectate=true`);
            } else {
                const room = await joinRoom(roomId);
                navigate(`/room/${room.roomId}`);
            }
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to join room. Verify the Room ID.";
            setErrorMsg(msg);
        } finally {
            setLoadingJoin(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans">
            <Navbar />

            {/* Hero Banner Header */}
            <header className="relative py-14 px-6 overflow-hidden border-b border-zinc-900 bg-zinc-950/20 text-center shrink-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
                    <div className="absolute top-12 left-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-[120px]" />
                    <div className="absolute top-12 right-1/4 w-80 h-80 rounded-full bg-rose-500/5 blur-[120px]" />
                </div>

                <div className="relative max-w-3xl mx-auto space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-850 text-xs font-semibold text-amber-400"
                    >
                        <Swords className="w-3.5 h-3.5 fill-amber-500/20 animate-pulse text-amber-500" />
                        <span>NeetCode 150 Dual Mode Arena</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.05 }}
                        className="text-4xl sm:text-5xl font-extrabold tracking-tight"
                    >
                        Battle. Code.{" "}
                        <span className="bg-gradient-to-r from-amber-400 via-rose-455 to-indigo-400 bg-clip-text text-transparent">
                          Conquer.
                        </span>
                    </motion.h1>
                    
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="text-zinc-500 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto"
                    >
                        Challenge competitors in 1v1 PvP Battle Arena duels, or join the Collaborative Studio to solve NeetCode 150 questions in real-time with code sync.
                    </motion.p>
                </div>
            </header>

            {/* Main Workspace Area */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-10">
                
                {/* Stats cards Grid */}
                <motion.section
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-5"
                >
                    {/* Stat item 1 */}
                    <div className="bg-zinc-950/60 border border-zinc-800/80 p-4.5 rounded-2xl shadow-xl flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                            <Award className="w-5.5 h-5.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-zinc-500 font-extrabold uppercase leading-none">Elo Rating</span>
                            <span className="text-lg font-bold font-mono text-zinc-200 mt-1">{rating}</span>
                        </div>
                    </div>

                    {/* Stat item 2 */}
                    <div className="bg-zinc-950/60 border border-zinc-800/80 p-4.5 rounded-2xl shadow-xl flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                            <Trophy className="w-5.5 h-5.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-zinc-500 font-extrabold uppercase leading-none">Rank Status</span>
                            <span className={`text-xs px-2 py-0.5 mt-1 font-bold rounded font-mono border w-fit leading-none ${tier.color}`}>
                                {tier.name}
                            </span>
                        </div>
                    </div>

                    {/* Stat item 3 */}
                    <div className="bg-zinc-950/60 border border-zinc-800/80 p-4.5 rounded-2xl shadow-xl flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-455 shrink-0">
                            <Swords className="w-5.5 h-5.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-zinc-500 font-extrabold uppercase leading-none">Battles Played</span>
                            <span className="text-lg font-bold font-mono text-zinc-200 mt-1">{totalBattles}</span>
                        </div>
                    </div>

                    {/* Stat item 4 */}
                    <div className="bg-zinc-950/60 border border-zinc-800/80 p-4.5 rounded-2xl shadow-xl flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                            <Activity className="w-5.5 h-5.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-zinc-500 font-extrabold uppercase leading-none">Win Ratio</span>
                            <span className="text-lg font-bold font-mono text-zinc-200 mt-1">{winRate}%</span>
                        </div>
                    </div>
                </motion.section>

                {/* Error Banner */}
                <AnimatePresence>
                    {errorMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-md"
                        >
                            <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl shadow-2xl">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span>{errorMsg}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Grid layout */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Card 1: Create Battle Room */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="relative group overflow-hidden bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 backdrop-blur-xl border border-zinc-800/60 rounded-2.5xl p-6.5 hover:border-amber-500/30 transition-all duration-300 shadow-xl"
                    >
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-amber-500/5 blur-[70px] pointer-events-none group-hover:bg-amber-500/10 transition-all" />

                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform duration-300">
                                <Swords className="w-6 h-6" />
                            </div>
                            
                            {/* Difficulty tab selection */}
                            <div className="flex flex-col text-right">
                                <div className="inline-flex p-0.5 rounded-lg bg-zinc-950 border border-zinc-900">
                                    {["Easy", "Medium", "Hard", "Random"].map((diff) => (
                                        <button
                                            key={diff}
                                            onClick={() => setDifficulty(diff)}
                                            className={`px-2 py-1 text-[9px] font-extrabold rounded-md outline-none transition-all cursor-pointer ${difficulty === diff ? "bg-amber-500 text-zinc-950" : "text-zinc-500 hover:text-zinc-300"}`}
                                        >
                                            {diff}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <h2 className="text-base font-bold mb-1.5">Launch PvP Battle Mode</h2>
                        <p className="text-zinc-500 text-[11px] mb-8 leading-relaxed font-medium min-h-[48px]">
                            Provision an instant competitive arena room. Code synchronization is disabled and standard Elo rating rules apply. First correct solution wins.
                        </p>

                        <button
                            onClick={handleCreateBattleRoom}
                            disabled={loadingCreate}
                            className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-zinc-950 font-bold text-[11px] rounded-xl shadow-lg shadow-amber-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 group/btn cursor-pointer"
                        >
                            {loadingCreate ? (
                                <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <PlusCircle className="w-4 h-4" />
                                    Create Battle Arena
                                </>
                            )}
                        </button>
                    </motion.div>

                    {/* Card 2: Create Collaborative Room */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="relative group overflow-hidden bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 backdrop-blur-xl border border-zinc-800/60 rounded-2.5xl p-6.5 hover:border-indigo-500/30 transition-all duration-300 shadow-xl"
                    >
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-indigo-500/5 blur-[70px] pointer-events-none group-hover:bg-indigo-500/10 transition-all" />

                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform duration-300">
                                <Users2 className="w-6 h-6" />
                            </div>
                            <span className="text-[9px] text-zinc-550 font-mono font-bold uppercase tracking-wider bg-zinc-900/40 border border-zinc-850 px-2 py-0.5 rounded">
                                Code Sync
                            </span>
                        </div>

                        <h2 className="text-base font-bold mb-1.5">Collaborative Study Mode</h2>
                        <p className="text-zinc-500 text-[11px] mb-8 leading-relaxed font-medium min-h-[48px]">
                            Study algorithms with friends. Browse the NeetCode 150 library, select a target problem manually, invite friends, and write solutions together with active code synchronization.
                        </p>

                        <Link
                            to="/library"
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded-xl shadow-lg shadow-indigo-600/15 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <Library className="w-4 h-4" />
                            Select Problem & Launch
                        </Link>
                    </motion.div>

                    {/* Card 3: Join / Spectate Room Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="relative group overflow-hidden bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 backdrop-blur-xl border border-zinc-800/60 rounded-2.5xl p-6.5 hover:border-zinc-700 transition-all duration-300 shadow-xl md:col-span-2 lg:col-span-1"
                    >
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-zinc-500/5 blur-[70px] pointer-events-none group-hover:bg-zinc-500/10 transition-all" />

                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 mb-5 group-hover:scale-105 transition-transform duration-300">
                            <LogIn className="w-6 h-6" />
                        </div>

                        <h2 className="text-base font-bold mb-1.5">Join Existing Room</h2>
                        <p className="text-zinc-500 text-[11px] mb-6 leading-relaxed font-medium min-h-[48px]">
                            Enter an existing room code. Participate directly as a player, or enter spectating logs to view coding sessions dynamically.
                        </p>

                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Enter Room ID (e.g. DRO8PQ)"
                                value={roomId}
                                onChange={(e) => {
                                    setRoomId(e.target.value);
                                    if (errorMsg) setErrorMsg("");
                                }}
                                className="w-full px-3.5 py-2.5 bg-zinc-950/50 border border-zinc-850 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-800 rounded-xl text-xs font-mono text-zinc-250 placeholder-zinc-700 outline-none transition-all"
                            />
                            
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleJoinRoom(false)}
                                    disabled={loadingJoin}
                                    className="flex-1 py-2.8 bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 text-zinc-200 font-semibold text-[10px] rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    {loadingJoin ? (
                                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <LogIn className="w-3.5 h-3.5" />
                                            Player Join
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => handleJoinRoom(true)}
                                    disabled={loadingJoin}
                                    className="py-2.8 px-3 bg-zinc-950 border border-zinc-900 hover:border-zinc-850 text-zinc-400 font-semibold text-[10px] rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    title="Spectate Arena"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    Spectate
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;