import { useState, useEffect } from "react";
import { getProblems } from "../services/problemService";
import { createRoom } from "../services/roomService";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { 
  Search, Filter, BookOpen, Swords, ArrowRight, Code, 
  HelpCircle, Sparkles, Star, BrainCircuit, Play, Cpu, Tag, 
  Layers, Clock, Trophy, ChevronRight, Zap, Bookmark
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Library() {
    const navigate = useNavigate();
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("All");
    const [selectedTopic, setSelectedTopic] = useState("All");
    const [creatingRoomId, setCreatingRoomId] = useState(null);
    const [selectedProblemId, setSelectedProblemId] = useState(null);

    useEffect(() => {
        const fetchProblemsData = async () => {
            try {
                const data = await getProblems();
                setProblems(data);
                if (data.length > 0) {
                    setSelectedProblemId(data[0]._id);
                }
            } catch (err) {
                console.error("Error loading library problems:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProblemsData();
    }, []);

    // Filter Logic
    const filteredProblems = problems.filter((prob) => {
        const matchesSearch = prob.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDifficulty = selectedDifficulty === "All" || prob.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
        
        let matchesTopic = selectedTopic === "All";
        if (selectedTopic !== "All") {
            const normalizedTopic = selectedTopic.toLowerCase();
            matchesTopic = prob.tags?.some(tag => {
                const normalizedTag = tag.toLowerCase();
                return normalizedTag.includes(normalizedTopic) || normalizedTopic.includes(normalizedTag);
            });
        }

        return matchesSearch && matchesDifficulty && matchesTopic;
    });

    const handleCreateCollabRoom = async (problemId) => {
        setCreatingRoomId(problemId);
        try {
            const room = await createRoom({
                roomType: "collab",
                problemId
            });
            navigate(`/room/${room.roomId}`);
        } catch (err) {
            console.error("Failed to provision collaborative room:", err);
        } finally {
            setCreatingRoomId(null);
        }
    };

    const getDifficultyClass = (diff) => {
        if (!diff) return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
        if (diff.toLowerCase() === "easy") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        if (diff.toLowerCase() === "medium") return "text-amber-400 bg-amber-500/10 border-amber-500/20";
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    };

    const activeProblem = problems.find(p => p._id === selectedProblemId) || filteredProblems[0] || null;

    return (
        <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans relative overflow-x-hidden">
            <Navbar />

            {/* Glowing background blur overlays */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/[0.015] blur-[140px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-amber-500/[0.015] blur-[120px] pointer-events-none" />

            <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto px-6 py-6 gap-6 relative z-10 overflow-hidden">
                
                {/* Left Side: Category Filter & Interactive Cards list */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                    
                    {/* Top title area */}
                    <div className="space-y-1 text-left">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.04] text-[9.5px] font-extrabold text-indigo-400 uppercase tracking-widest">
                            <BrainCircuit className="w-3.5 h-3.5" />
                            NeetCode 150 Core Pool
                        </div>
                        <h1 className="text-2xl sm:text-3.5xl font-black tracking-tight mt-1.5">
                            Challenge Index
                        </h1>
                        <p className="text-zinc-550 text-xs font-semibold leading-relaxed max-w-xl">
                            Select a puzzle card to preview compiler criteria, verify constraints, and initialize dual pair programming sandboxes.
                        </p>
                    </div>

                    {/* Integrated Search Command and filter sliders */}
                    <div className="flex flex-col md:flex-row items-center gap-4 bg-[#08080a] border border-white/[0.04] p-4 rounded-2.5xl">
                        
                        {/* Interactive Search query */}
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-650" />
                            <input
                                type="text"
                                placeholder="Search index (e.g. Two Sum)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10.5 pr-4 py-2.5 bg-zinc-950 border border-white/[0.04] focus:border-white/[0.1] rounded-xl text-xs placeholder-zinc-850 outline-none text-zinc-300 transition-all font-semibold font-mono"
                            />
                        </div>

                        {/* Dropdown topic selectors */}
                        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 select-none">
                            <select
                                value={selectedTopic}
                                onChange={(e) => setSelectedTopic(e.target.value)}
                                className="w-full md:w-auto bg-zinc-950 border border-white/[0.04] text-zinc-450 text-[11px] font-bold px-3 py-2.2 rounded-xl outline-none cursor-pointer"
                            >
                                <option value="All">All Topics</option>
                                <option value="Arrays">Arrays</option>
                                <option value="Hashing">Hashing</option>
                                <option value="Sliding Window">Sliding Window</option>
                                <option value="Binary Search">Binary Search</option>
                                <option value="Trees">Trees</option>
                                <option value="Graphs">Graphs</option>
                                <option value="DP">DP</option>
                            </select>

                            <div className="flex p-0.5 rounded-xl bg-zinc-950 border border-white/[0.04]">
                                {["All", "Easy", "Medium", "Hard"].map((diff) => (
                                    <button
                                        key={diff}
                                        onClick={() => setSelectedDifficulty(diff)}
                                        className={`px-3 py-1.5 text-[9.5px] font-extrabold rounded-lg outline-none transition-all cursor-pointer ${selectedDifficulty === diff ? "bg-white/[0.04] text-indigo-400 border border-white/[0.04] shadow-sm" : "text-zinc-550 hover:text-zinc-350"}`}
                                    >
                                        {diff}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Cards browser area */}
                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 text-zinc-650">
                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3.5" />
                            <p className="text-[11px] font-semibold font-mono">Syncing problem pools...</p>
                        </div>
                    ) : filteredProblems.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 border border-dashed border-white/[0.04] rounded-3xl bg-zinc-950/20 text-center">
                            <HelpCircle className="w-9 h-9 text-zinc-800 mb-3" />
                            <h3 className="text-xs font-bold text-zinc-450">Index search returned empty</h3>
                            <p className="text-zinc-650 text-[10px] mt-0.5 font-medium">Try loosening the difficulty or query tags.</p>
                        </div>
                    ) : (
                        <motion.div 
                            layout
                            className="grid sm:grid-cols-2 gap-4.5"
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredProblems.map((prob) => {
                                    const isSelected = activeProblem?._id === prob._id;
                                    return (
                                        <motion.div
                                            key={prob._id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            onClick={() => setSelectedProblemId(prob._id)}
                                            className={`bg-[#08080a] border p-5 rounded-2.5xl flex flex-col justify-between hover:border-zinc-800 transition-all duration-200 group cursor-pointer relative ${isSelected ? "border-indigo-500/50 bg-gradient-to-br from-indigo-500/[0.015] to-[#08080a] shadow-lg shadow-indigo-500/5" : "border-white/[0.04]"}`}
                                        >
                                            <div className="space-y-3 text-left">
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded font-mono border ${getDifficultyClass(prob.difficulty)}`}>
                                                        {prob.difficulty}
                                                    </span>
                                                    <span className="text-[8.5px] text-zinc-650 font-mono font-bold flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        20 min
                                                    </span>
                                                </div>

                                                <h3 className="text-sm font-bold text-zinc-250 group-hover:text-zinc-100 transition-colors leading-snug truncate">
                                                    {prob.title}
                                                </h3>

                                                {prob.tags && prob.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {prob.tags.slice(0, 3).map((tag, idx) => (
                                                            <span 
                                                                key={idx} 
                                                                className="text-[8px] font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-1.5 py-0.5 rounded"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-5 pt-3.5 border-t border-white/[0.03] flex items-center justify-between">
                                                <span className="text-[8.5px] text-zinc-650 font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                                                    <Tag className="w-3.5 h-3.5 text-zinc-800" />
                                                    Code Sync
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-zinc-650 group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </motion.div>
                    )}

                </div>

                {/* Right Side: Immersive Preview Canvas panel */}
                <div className="w-full lg:w-[38%] min-w-[320px] shrink-0">
                    <div className="bg-[#08080a] border border-white/[0.04] p-6.5 rounded-3xl sticky top-6 shadow-2xl flex flex-col justify-between text-left min-h-[500px]">
                        
                        {activeProblem ? (
                            <div className="space-y-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between border-b border-white/[0.03] pb-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Trophy className="w-4.5 h-4.5 text-amber-500" />
                                            <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">Target Challenge details</span>
                                        </div>
                                        <button className="text-zinc-650 hover:text-zinc-350 transition-colors">
                                            <Bookmark className="w-4.5 h-4.5" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <span className={`text-[8px] uppercase px-2.5 py-0.5 rounded font-bold border font-mono w-fit block ${getDifficultyClass(activeProblem.difficulty)}`}>
                                                {activeProblem.difficulty}
                                            </span>
                                            <h2 className="text-lg font-black text-zinc-200 leading-snug">{activeProblem.title}</h2>
                                        </div>

                                        <p className="text-zinc-450 text-[11.5px] leading-relaxed font-semibold max-h-[170px] overflow-y-auto pr-1">
                                            {activeProblem.statement}
                                        </p>
                                    </div>

                                    {activeProblem.constraints && (
                                        <div className="mt-5.5 space-y-2">
                                            <span className="text-[9px] text-zinc-650 font-bold uppercase tracking-widest block">Parameters constraints</span>
                                            <pre className="text-zinc-500 text-[10px] pl-4 font-mono leading-relaxed bg-white/[0.01] p-2.5 rounded-xl border border-white/[0.02] overflow-x-auto select-none">
                                                {activeProblem.constraints}
                                            </pre>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-white/[0.03]">
                                    <button
                                        onClick={() => handleCreateCollabRoom(activeProblem._id)}
                                        disabled={creatingRoomId !== null}
                                        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-400 hover:to-rose-455 text-zinc-950 font-black text-[12px] rounded-xl shadow-lg shadow-indigo-500/5 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    >
                                        {creatingRoomId === activeProblem._id ? (
                                            <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Zap className="w-4 h-4 text-zinc-950 fill-zinc-950 animate-pulse" />
                                                Initialize Peer Workspace
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-zinc-750 text-center py-20">
                                <HelpCircle className="w-8 h-8 text-zinc-800 mb-2.5" />
                                <h4 className="text-[11px] font-bold text-zinc-500">Preview buffer idle</h4>
                                <p className="text-[10px] mt-0.5">Choose a coding card to load target parameters.</p>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}

export default Library;
