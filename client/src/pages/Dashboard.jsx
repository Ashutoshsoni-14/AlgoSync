import { useState, useEffect } from "react";
import { createRoom, joinRoom } from "../services/roomService";
import { getProfile } from "../services/leaderboardService";
import { useNavigate, Link } from "react-router-dom";
import { 
  Swords, PlusCircle, LogIn, Sparkles, Award, BookOpen, 
  AlertCircle, Eye, Users, Trophy, ChevronRight, Activity, Users2, Library, 
  Flame, Calendar, ShieldAlert, LogOut, ChevronLeft, Layers, Compass, TrendingUp
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

// Custom ELO SVG Progress ring
function EloProgressRing({ elo, size = 110, stroke = 5.5 }) {
  const maxElo = 2400;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(elo / maxElo, 1);
  const strokeOffset = circumference - progressRatio * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="url(#eloGrad)" strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeOffset} />
        <defs>
          <linearGradient id="eloGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
        <span className="text-[17px] font-black text-zinc-150 leading-none">{elo}</span>
        <span className="text-[7.5px] text-zinc-650 font-bold uppercase tracking-widest mt-1">ELO</span>
      </div>
    </div>
  );
}

// Custom SVG Radar Competency Chart
function SkillRadarChart({ rating, winRate, totalBattles }) {
  const speed = Math.min(55 + totalBattles * 1.5, 95);
  const accuracy = Math.min(45 + winRate * 0.5, 95);
  const consistency = Math.min(35 + totalBattles * 2, 90);
  const algorithms = Math.min(50 + (rating - 1200) * 0.07, 95);
  const eloScore = Math.min((rating / 2400) * 100, 95);

  const getCoords = (val, deg) => {
    const rad = (deg - 90) * (Math.PI / 180);
    const r = (val / 100) * 70;
    const x = 100 + r * Math.cos(rad);
    const y = 100 + r * Math.sin(rad);
    return { x, y };
  };

  const p1 = getCoords(algorithms, 0);
  const p2 = getCoords(speed, 72);
  const p3 = getCoords(accuracy, 144);
  const p4 = getCoords(consistency, 216);
  const p5 = getCoords(eloScore, 288);

  const radarPath = `M ${p1.x},${p1.y} L ${p2.x},${p2.y} L ${p3.x},${p3.y} L ${p4.x},${p4.y} L ${p5.x},${p5.y} Z`;

  return (
    <div className="bg-[#08080a] border border-white/[0.04] p-5 rounded-2.5xl flex flex-col items-center shadow-xl">
      <div className="flex items-center justify-between border-b border-white/[0.03] pb-3 mb-4 w-full text-xs">
        <span className="text-zinc-550 font-bold uppercase tracking-wider text-[9px]">Competency Profile</span>
        <span className="text-[8px] text-zinc-650 font-mono">Radar scale updates dynamically</span>
      </div>
      
      <div className="relative w-44 h-44">
        <svg viewBox="0 0 200 200" className="w-full h-full stroke-white/[0.04] fill-none">
          <circle cx="100" cy="100" r="70" />
          <circle cx="100" cy="100" r="50" />
          <circle cx="100" cy="100" r="30" />
          {Array.from({ length: 5 }).map((_, i) => {
            const rad = (i * 72 - 90) * (Math.PI / 180);
            return (
              <line key={i} x1="100" y1="100" x2={100 + 70 * Math.cos(rad)} y2={100 + 70 * Math.sin(rad)} />
            );
          })}
          <path d={radarPath} fill="rgba(99, 102, 241, 0.1)" stroke="rgba(99, 102, 241, 0.6)" strokeWidth="1.5" />
        </svg>
        <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[8px] text-zinc-550 font-bold uppercase tracking-wider">Algo</span>
        <span className="absolute top-16 right-0 text-[8px] text-zinc-550 font-bold uppercase tracking-wider">Speed</span>
        <span className="absolute bottom-5 right-4 text-[8px] text-zinc-550 font-bold uppercase tracking-wider">Accu</span>
        <span className="absolute bottom-5 left-4 text-[8px] text-zinc-550 font-bold uppercase tracking-wider">Cons</span>
        <span className="absolute top-16 left-0 text-[8px] text-zinc-550 font-bold uppercase tracking-wider">Rank</span>
      </div>
    </div>
  );
}

// Collapsible left sidebar navigation inspired by Arc Browser & Raycast
function CollapsibleSidebar({ expanded, setExpanded, profileData }) {
  const navigate = useNavigate();
  
  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: Layers },
    { label: "Problem Library", path: "/library", icon: BookOpen },
    { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { label: "Profile", path: "/profile", icon: UserIcon }
  ];

  function UserIcon() {
    return (
      <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center text-[8.5px] font-bold text-white uppercase shrink-0">
        {profileData?.name ? profileData.name.substring(0, 2) : "CD"}
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <motion.aside
      animate={{ width: expanded ? 220 : 68 }}
      transition={{ type: "spring", stiffness: 320, damping: 25 }}
      className="hidden md:flex flex-col justify-between bg-zinc-950/65 backdrop-blur-2xl border-r border-white/[0.03] p-4 shrink-0 h-screen sticky top-0 z-45"
    >
      <div className="space-y-8">
        {/* Header brand details */}
        <div className="flex items-center gap-3 pl-1.5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center justify-center w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 shadow-md shrink-0">
            <Swords className="w-4.5 h-4.5 text-white" />
          </div>
          {expanded && (
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-black tracking-tight bg-gradient-to-r from-amber-400 to-rose-455 bg-clip-text text-transparent leading-none">
                AlgoSync
              </span>
              <span className="text-[6.5px] text-zinc-650 font-mono tracking-widest uppercase mt-0.5 leading-none font-bold">
                Operating System
              </span>
            </div>
          )}
        </div>

        {/* Navigation lists */}
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = window.location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? "bg-white/[0.04] text-amber-450 border border-white/[0.04]" : "text-zinc-550 hover:text-zinc-200 hover:bg-white/[0.02]"}`}
              >
                <div className="shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                {expanded && (
                  <span className="text-xs font-bold whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Logout triggers */}
      <div className="space-y-3 border-t border-white/[0.03] pt-4">
        {expanded && profileData && (
          <div className="flex items-center gap-2.5 px-2">
            <div className="flex flex-col text-left min-w-0">
              <span className="text-xs font-bold text-zinc-300 leading-none truncate">{profileData.name}</span>
              <span className="text-[8.5px] text-zinc-650 font-mono mt-1 leading-none truncate">{profileData.email}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-600 hover:text-rose-455 hover:bg-rose-500/5 active:scale-95 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {expanded && <span className="text-xs font-bold whitespace-nowrap">Log Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}

function Dashboard() {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState("");
    const [difficulty, setDifficulty] = useState("Random");
    const [errorMsg, setErrorMsg] = useState("");
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [loadingJoin, setLoadingJoin] = useState(false);
    const [profile, setProfile] = useState(null);
    const [expanded, setExpanded] = useState(true);

    // Fetch user profile stats
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const data = await getProfile();
                setProfile(data);
                const localUser = JSON.parse(localStorage.getItem("user")) || {};
                localStorage.setItem("user", JSON.stringify({ ...localUser, ...data }));
            } catch (err) {
                console.log("Error loading latest profile details:", err);
            }
        };
        fetchProfileData();
    }, []);

    const rating = profile?.rating ?? 1200;
    const totalBattles = (profile?.wins ?? 0) + (profile?.losses ?? 0);
    const winRate = totalBattles > 0 ? Math.round((profile.wins / totalBattles) * 100) : 0;

    const countRating = useCountingMetric(rating);
    const countBattles = useCountingMetric(totalBattles);
    const countWins = useCountingMetric(profile?.wins ?? 0);
    const countWR = useCountingMetric(winRate);

    // Time-aware welcome banner greeting
    const hour = new Date().getHours();
    const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const userName = profile?.name || "Coder";

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

    const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
    const fadeUp = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

    return (
        <div className="min-h-screen bg-[#070709] text-zinc-100 flex font-sans relative overflow-x-hidden">
            
            {/* Collapsible left sidebar navigation panel */}
            <CollapsibleSidebar expanded={expanded} setExpanded={setExpanded} profileData={profile} />

            {/* Main Content Workspace Panel */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative z-30">
                
                {/* Background mesh lighting blurs */}
                <div className="absolute top-0 left-1/3 w-[600px] h-[400px] rounded-full bg-amber-500/[0.02] blur-[150px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/3 w-[500px] h-[400px] rounded-full bg-indigo-500/[0.02] blur-[150px] pointer-events-none" />

                <main className="max-w-6xl w-full mx-auto px-6 py-8 space-y-8 relative z-10 flex-1">
                  
                  {/* Personal greeting hero banner */}
                  <motion.section 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-gradient-to-br from-white/[0.02] via-[#08080a] to-[#070709] border border-white/[0.04] p-6.5 rounded-2.5xl flex flex-col lg:flex-row items-center justify-between gap-6 overflow-hidden shadow-2xl"
                  >
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-indigo-500/[0.02] blur-xl pointer-events-none" />
                    
                    <div className="space-y-4 text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.04] text-[9.5px] font-bold text-zinc-450 uppercase tracking-widest shadow-xl">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        Mission Control Center
                      </div>
                      <h1 className="text-3xl sm:text-4.5xl font-black tracking-tight leading-none mt-2">
                        {greet}, <span className="gradient-text">{userName}</span>
                      </h1>
                      <p className="text-zinc-500 text-xs font-semibold leading-relaxed max-w-md">
                        Challenge other coders inside private compilation rooms, or collaborate in sync code studios.
                      </p>
                      
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-500 text-xs font-bold shadow-sm">
                        <Flame className="w-4 h-4 fill-amber-500/20" />
                        <span>7-Day Coding Streak Active</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-6">
                      <EloProgressRing elo={rating} />
                    </div>
                  </motion.section>

                  {/* Errors and warnings list */}
                  <AnimatePresence>
                    {errorMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="max-w-md"
                      >
                        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl shadow-2xl">
                          <AlertCircle className="w-5 h-5 shrink-0 text-rose-550" />
                          <span>{errorMsg}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Primary control cards */}
                  <motion.div 
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="grid lg:grid-cols-3 gap-6"
                  >
                    
                    {/* Battle Center matching logic */}
                    <motion.div 
                      variants={fadeUp}
                      className="bg-[#08080a] border border-white/[0.04] p-6.5 rounded-2.5xl flex flex-col justify-between relative overflow-hidden card-hover-scale glow-border-amber text-left"
                    >
                      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-amber-500/[0.02] blur-xl pointer-events-none" />
                      
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/5 border border-amber-500/15 text-amber-400">
                            <Swords className="w-6 h-6" />
                          </div>
                          
                          <div className="inline-flex p-0.5 rounded-lg bg-zinc-950 border border-white/[0.04]">
                            {["Easy", "Medium", "Hard", "Random"].map((diff) => (
                              <button
                                key={diff}
                                onClick={() => setDifficulty(diff)}
                                className={`px-2 py-1 text-[9px] font-extrabold rounded-md outline-none transition-all cursor-pointer ${difficulty === diff ? "bg-amber-500 text-zinc-950" : "text-zinc-550 hover:text-zinc-350"}`}
                              >
                                {diff}
                              </button>
                            ))}
                          </div>
                        </div>

                        <h3 className="text-sm font-bold text-zinc-150 mb-1.5">PvP Arena Matchmaking</h3>
                        <p className="text-zinc-500 text-[11px] mb-8 leading-relaxed font-semibold">
                          Provision isolated code rooms. Dynamic matchmaking rules apply. First correct compile verdict increases Elo ratings.
                        </p>
                      </div>

                      <button
                        onClick={handleCreateBattleRoom}
                        disabled={loadingCreate}
                        className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-455 text-zinc-950 font-black text-[12px] rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {loadingCreate ? (
                          <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <PlusCircle className="w-4 h-4" />
                            Launch Duel Arena
                          </>
                        )}
                      </button>
                    </motion.div>

                    {/* Collaboration Center matching logic */}
                    <motion.div 
                      variants={fadeUp}
                      className="bg-[#08080a] border border-white/[0.04] p-6.5 rounded-2.5xl flex flex-col justify-between relative overflow-hidden card-hover-scale glow-border-indigo text-left"
                    >
                      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-indigo-500/[0.02] blur-xl pointer-events-none" />

                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/5 border border-indigo-500/15 text-indigo-400">
                            <Users2 className="w-6 h-6" />
                          </div>
                          <span className="text-[9px] text-zinc-550 font-mono font-bold uppercase tracking-wider bg-zinc-900/40 border border-white/[0.04] px-2.5 py-0.5 rounded">
                            Sync Live
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-zinc-150 mb-1.5">Collaborative Workspace</h3>
                        <p className="text-zinc-500 text-[11px] mb-8 leading-relaxed font-semibold">
                          Write solutions side-by-side. Browse target challenges manually, sync code inputs, and debug logic parameters.
                        </p>
                      </div>

                      <Link
                        to="/library"
                        className="w-full py-3 bg-indigo-655 hover:bg-indigo-600 text-white font-black text-[12px] rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Library className="w-4 h-4" />
                        Select Challenge & Launch
                      </Link>
                    </motion.div>

                    {/* Join Lobby dashboard actions */}
                    <motion.div 
                      variants={fadeUp}
                      className="bg-[#08080a] border border-white/[0.04] p-6.5 rounded-2.5xl flex flex-col justify-between relative overflow-hidden card-hover-scale text-left"
                    >
                      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-zinc-500/[0.02] blur-xl pointer-events-none" />

                      <div>
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.02] border border-white/[0.04] text-zinc-450 mb-6">
                          <LogIn className="w-6 h-6" />
                        </div>

                        <h3 className="text-sm font-bold text-zinc-150 mb-1.5">Access Existing Space</h3>
                        <p className="text-zinc-500 text-[11px] mb-6 leading-relaxed font-semibold">
                          Input an active room code. Participate directly inside workspaces, or view live streams as spectators.
                        </p>
                      </div>

                      <div className="space-y-3 pt-2">
                        <input
                          type="text"
                          placeholder="Enter Room ID (e.g. DRO8PQ)"
                          value={roomId}
                          onChange={(e) => {
                            setRoomId(e.target.value);
                            if (errorMsg) setErrorMsg("");
                          }}
                          className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/[0.04] focus:border-white/[0.1] rounded-xl text-xs font-mono text-zinc-300 placeholder-zinc-800 outline-none transition-all"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleJoinRoom(false)}
                            disabled={loadingJoin}
                            className="flex-1 py-2.8 bg-zinc-900 border border-white/[0.04] hover:bg-white/[0.04] text-zinc-200 font-bold text-[11.5px] rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {loadingJoin ? (
                              <div className="w-4 h-4 border-2 border-zinc-250 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <LogIn className="w-3.5 h-3.5" />
                                Join Arena
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleJoinRoom(true)}
                            disabled={loadingJoin}
                            className="py-2.8 px-3.5 bg-zinc-950 border border-white/[0.04] hover:bg-white/[0.02] text-zinc-550 hover:text-zinc-250 font-bold text-[11.5px] rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>

                  </motion.div>

                  {/* Split visual data displays and timeline nodes */}
                  <div className="grid lg:grid-cols-3 gap-6 pt-4">
                    
                    {/* Visual competency plots */}
                    <div className="lg:col-span-1 space-y-6">
                      <SkillRadarChart rating={rating} winRate={winRate} totalBattles={totalBattles} />
                      
                      {/* Secondary winratio progress logs */}
                      <div className="bg-[#08080a] border border-white/[0.04] p-5 rounded-2.5xl text-xs space-y-4 text-left">
                        <span className="text-[9px] text-zinc-650 font-bold uppercase tracking-wider block">Win Ratio Breakdown</span>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500 font-semibold font-mono">Wins / Losses</span>
                          <span className="font-mono text-zinc-300 font-bold">
                            <span className="text-emerald-450">{profile?.wins ?? 0}</span>
                            <span className="mx-1 text-zinc-600">/</span>
                            <span className="text-rose-455">{profile?.losses ?? 0}</span>
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/[0.02] border border-white/[0.04] rounded-full overflow-hidden flex">
                          <div className="h-full bg-emerald-500" style={{ width: `${winRate}%` }} />
                          <div className="h-full bg-rose-500" style={{ width: `${100 - winRate}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Timeline match activity log panel */}
                    <div className="lg:col-span-2">
                      <div className="bg-[#08080a] border border-white/[0.04] p-6.5 rounded-2.5xl shadow-xl flex flex-col h-full justify-between">
                        <div>
                          <h3 className="text-xs font-bold text-zinc-350 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-white/[0.03] pb-3 shrink-0">
                            <Calendar className="w-4 h-4 text-indigo-400" />
                            Recent Activity Lobbies
                          </h3>

                          {profile?.battleHistory && profile.battleHistory.length > 0 ? (
                            <div className="relative border-l border-white/[0.03] pl-5 space-y-6 max-h-[310px] overflow-y-auto pr-1">
                              {[...profile.battleHistory].reverse().slice(0, 5).map((battle) => {
                                const isWon = battle.winner === profile._id;
                                const dateStr = new Date(battle.createdAt || battle.startTime).toLocaleDateString(undefined, {
                                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                                });
                                const participant = battle.participants?.find(p => p.user?.toString() === profile._id.toString());
                                const ratingDiff = participant?.ratingChange ?? 0;

                                return (
                                  <div key={battle._id} className="relative">
                                    <div className={`absolute -left-[26px] top-1.5 w-2 h-2 rounded-full border bg-zinc-950 ${isWon ? "border-emerald-500 shadow-md shadow-emerald-500/20" : "border-rose-500 shadow-md shadow-rose-500/20"}`} />
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left">
                                      <div className="flex flex-col text-left">
                                        <span className="text-xs font-bold text-zinc-300">
                                          {isWon ? "Match Victory" : "Defeat Status"}
                                        </span>
                                        <span className="text-[9.5px] text-zinc-650 font-mono mt-0.5">
                                          Arena ID: {battle.room || battle._id}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {ratingDiff !== 0 && (
                                          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 font-mono ${ratingDiff > 0 ? "text-emerald-450 bg-emerald-500/5 border border-emerald-500/15" : "text-rose-455 bg-rose-500/5 border border-rose-500/15"}`}>
                                            <TrendingUp className={`w-3 h-3 ${ratingDiff < 0 ? "rotate-180" : ""}`} />
                                            {ratingDiff > 0 ? `+${ratingDiff}` : ratingDiff} ELO
                                          </span>
                                        )}
                                        <span className="text-[9.5px] text-zinc-600 font-mono bg-white/[0.02] border border-white/[0.04] px-2 py-0.5 rounded">
                                          {dateStr}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-zinc-650 text-center">
                              <ShieldAlert className="w-9 h-9 text-zinc-800 mb-2.5" />
                              <h4 className="text-[11.5px] font-bold text-zinc-400">Timeline buffer empty</h4>
                              <p className="text-[10px] mt-0.5 font-medium">Create a battle room to record activity logs.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>

                </main>
            </div>

        </div>
    );
}

export default Dashboard;