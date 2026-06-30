import { useState, useEffect } from "react";
import { getProblems } from "../services/problemService";
import { createRoom } from "../services/roomService";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { 
  Search, Filter, BookOpen, Swords, ArrowRight, Code, 
  HelpCircle, Sparkles, Star, BrainCircuit, Play, Cpu, Tag
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

    useEffect(() => {
        const fetchProblemsData = async () => {
            try {
                const data = await getProblems();
                setProblems(data);
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
        
        // Topic mapping checks
        let matchesTopic = selectedTopic === "All";
        if (selectedTopic !== "All") {
            const normalizedTopic = selectedTopic.toLowerCase();
            matchesTopic = prob.tags?.some(tag => {
                const normalizedTag = tag.toLowerCase();
                // Check direct matches or subsets e.g. "arrays & hashing" contains "arrays" or "hashing"
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
        if (diff.toLowerCase() === "easy") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        if (diff.toLowerCase() === "medium") return "text-amber-400 bg-amber-500/10 border-amber-500/20";
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    };

    return (
        <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans">
            <Navbar />

            {/* Header section */}
            <header className="relative py-12 px-6 border-b border-zinc-900 bg-zinc-950/20 text-center shrink-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
                    <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-indigo-500/5 blur-[100px]" />
                </div>

                <div className="relative max-w-3xl mx-auto space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-850 text-xs font-semibold text-indigo-400">
                        <BrainCircuit className="w-3.5 h-3.5" />
                        <span>NeetCode 150 Library</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        Problem Library
                    </h1>
                    
                    <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto font-medium">
                        Browse top interview questions. Select a problem to start a real-time collaborative study workspace with your partners.
                    </p>
                </div>
            </header>

            {/* Filters and search layout */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-8">
                
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-zinc-950/60 border border-zinc-900/60 p-5 rounded-2xl">
                    {/* Left: search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-650" />
                        <input
                            type="text"
                            placeholder="Search by title (e.g. Two Sum)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/30 border border-zinc-850 focus:border-indigo-500/55 rounded-xl text-xs placeholder-zinc-700 outline-none text-zinc-300 transition-all font-medium"
                        />
                    </div>

                    {/* Right: filters */}
                    <div className="flex flex-wrap gap-4 items-center">
                        
                        {/* Difficulty filter tabs */}
                        <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider mb-1.5 pl-0.5">
                                Difficulty
                            </span>
                            <div className="inline-flex p-0.5 rounded-lg bg-zinc-900/40 border border-zinc-850">
                                {["All", "Easy", "Medium", "Hard"].map((diff) => (
                                    <button
                                        key={diff}
                                        onClick={() => setSelectedDifficulty(diff)}
                                        className={`px-3 py-1.5 text-[10px] font-bold rounded-md outline-none transition-all cursor-pointer ${selectedDifficulty === diff ? "bg-zinc-850 text-indigo-400 border border-zinc-800 shadow" : "text-zinc-500 hover:text-zinc-350"}`}
                                    >
                                        {diff}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Topics select filter */}
                        <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider mb-1.5 pl-0.5">
                                Topic Filters
                            </span>
                            <select
                                value={selectedTopic}
                                onChange={(e) => setSelectedTopic(e.target.value)}
                                className="bg-zinc-900/40 border border-zinc-850 hover:border-zinc-800 text-zinc-400 text-[11px] font-bold px-3 py-1.8 rounded-lg outline-none focus:border-indigo-500/50 cursor-pointer"
                            >
                                <option value="All">All Topics</option>
                                <option value="Arrays">Arrays</option>
                                <option value="Hashing">Hashing</option>
                                <option value="Sliding Window">Sliding Window</option>
                                <option value="Binary Search">Binary Search</option>
                                <option value="Trees">Trees</option>
                                <option value="Graphs">Graphs</option>
                                <option value="DP">DP (Dynamic Programming)</option>
                            </select>
                        </div>

                    </div>
                </div>

                {/* Problems list/grid grid-cols */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-550">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-xs font-semibold">Retrieving interview coding questions...</p>
                    </div>
                ) : filteredProblems.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-zinc-900 rounded-2.5xl bg-zinc-950/20">
                        <HelpCircle className="w-9 h-9 text-zinc-800 mx-auto mb-2.5" />
                        <h3 className="text-sm font-bold text-zinc-450">No problems found</h3>
                        <p className="text-zinc-600 text-[11px] mt-0.5">Try widening search criteria or filters.</p>
                    </div>
                ) : (
                    <motion.div 
                        layout 
                        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredProblems.map((prob) => (
                                <motion.div
                                    key={prob._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-800 transition-colors group relative"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded font-mono border ${getDifficultyClass(prob.difficulty)}`}>
                                                {prob.difficulty}
                                            </span>
                                            
                                            <span className="text-[10px] text-zinc-650 font-mono font-bold flex items-center gap-1">
                                                <Cpu className="w-3.5 h-3.5" />
                                                1v1 Collab
                                            </span>
                                        </div>

                                        <h3 className="text-sm font-bold text-zinc-200 truncate group-hover:text-zinc-100 transition-colors">
                                            {prob.title}
                                        </h3>

                                        {/* Tags mapping */}
                                        {prob.tags && prob.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {prob.tags.map((tag, idx) => (
                                                    <span 
                                                        key={idx} 
                                                        className="text-[9px] font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action button */}
                                    <div className="mt-6 pt-3.5 border-t border-zinc-900/60 flex items-center justify-between">
                                        <span className="text-[10px] text-zinc-600 font-bold flex items-center gap-1">
                                            <Tag className="w-3.5 h-3.5 text-zinc-700" />
                                            Interview Prep
                                        </span>
                                        <button
                                            onClick={() => handleCreateCollabRoom(prob._id)}
                                            disabled={creatingRoomId !== null}
                                            className="px-3.5 py-1.8 bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white text-indigo-400 font-bold text-[10px] rounded-lg transition-all active:scale-97 cursor-pointer flex items-center gap-1 group/btn"
                                        >
                                            {creatingRoomId === prob._id ? (
                                                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    Collab Study
                                                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

            </main>
        </div>
    );
}

export default Library;
