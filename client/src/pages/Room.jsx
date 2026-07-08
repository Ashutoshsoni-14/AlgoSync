import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Editor from "@monaco-editor/react";
import socket from "../socket/socket";
import { getProblems } from "../services/problemService";
import { runCode, submitCode } from "../services/codeService";
import { startBattle, submitBattle, getActiveBattle } from "../services/battleService";
import { getRoomDetails } from "../services/roomService";
import {
  Swords, Play, CheckCircle2, ArrowLeft, Copy, Check, Timer,
  Terminal, AlertCircle, XCircle, ChevronRight, Eye, Users,
  Code, Flame, Sparkles, Award, RotateCcw, Send, MessageSquare, ShieldAlert,
  Info, Sparkle, LayoutGrid, ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Confetti Burst Effect
function ConfettiBurst() {
  const elements = Array.from({ length: 45 });
  const colors = ["#f59e0b", "#ec4899", "#6366f1", "#10b981", "#3b82f6", "#ef4444"];
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {elements.map((_, idx) => {
        const bg = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const delay = Math.random() * 2.5;
        const duration = 2.5 + Math.random() * 2.5;
        return (
          <div
            key={idx}
            className="confetti-piece"
            style={{
              left: `${left}vw`,
              backgroundColor: bg,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}

// Circular progress countdown timer
function CircularTimerHUD({ seconds, isActive, max = 300 }) {
  const r = 20;
  const circumference = 2 * Math.PI * r;
  const fraction = isActive ? Math.max(0, seconds / max) : 0;
  const offset = circumference - fraction * circumference;

  let stroke = "stroke-emerald-500";
  if (seconds < 60) stroke = "stroke-rose-500 animate-pulse";
  else if (seconds < 180) stroke = "stroke-amber-500";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="48" height="48" className="transform -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="3" />
        {isActive && (
          <circle cx="24" cy="24" r={r} fill="none" strokeWidth="3"
            strokeLinecap="round" className={`transition-all duration-1000 ${stroke}`}
            strokeDasharray={circumference} strokeDashoffset={offset} />
        )}
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center font-mono text-[11px] font-black ${seconds < 60 ? "text-rose-500 animate-ping" : seconds < 180 ? "text-amber-500" : "text-emerald-400"}`}>
        {isActive ? `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}` : "--:--"}
      </div>
    </div>
  );
}

function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isSpectator = new URLSearchParams(location.search).get("spectate") === "true";

  // Core Editor states
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("selectedLanguage") || "cpp";
  });

  // Mode and Sync states
  const [problem, setProblem] = useState(null);
  const [allProblems, setAllProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [recentlyUsedProblems, setRecentlyUsedProblems] = useState([]);

  const [battleStarted, setBattleStarted] = useState(false);
  const [battleId, setBattleId] = useState("");
  const [timer, setTimer] = useState(300); // 5 min
  const [roundNumber, setRoundNumber] = useState(1);
  const [winner, setWinner] = useState(null);
  const [ratingChanges, setRatingChanges] = useState([]);

  // User and room states
  const [currentUser, setCurrentUser] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [players, setPlayers] = useState([]);
  const [spectators, setSpectators] = useState([]);
  const [spectatorCount, setSpectatorCount] = useState(0);
  const [playerLiveStatuses, setPlayerLiveStatuses] = useState({});

  // Chat states
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef(null);

  // Transition UI states
  const [copiedRoomId, setCopiedRoomId] = useState(false);
  const [copiedInput, setCopiedInput] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [activeConsoleTab, setActiveConsoleTab] = useState("input");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextRoundCountdown, setNextRoundCountdown] = useState(0);

  // Panel collapse toggles
  const [col1Collapsed, setCol1Collapsed] = useState(false);
  const [col3Collapsed, setCol3Collapsed] = useState(false);

  // Retrieve current user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Sync Room Participants
  const fetchRoomInfo = async () => {
    try {
      const data = await getRoomDetails(roomId);
      setRoomInfo(data);
      setPlayers(data.users || []);

      if (data.roomType === "battle" && data.isBattleActive) {
        try {
          const battle = await getActiveBattle(roomId);
          if (battle) {
            setBattleId(battle._id);
            setProblem(battle.problem);
            setBattleStarted(true);

            const elapsed = Math.floor((Date.now() - new Date(battle.startTime).getTime()) / 1000);
            const remaining = Math.max(0, 300 - elapsed);
            setTimer(remaining);
          }
        } catch (battleErr) {
          console.log("No active battle found or error loading battle:", battleErr);
        }
      }
    } catch (err) {
      console.log("Error fetching room details:", err);
    }
  };

  // Fetch all problems on mount
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const problems = await getProblems();
        setAllProblems(problems);
      } catch (err) {
        showToast("Error loading coding problems pool.");
      }
    };
    fetchProblems();
  }, []);

  // Filter problems once allProblems and roomInfo are loaded
  useEffect(() => {
    if (allProblems.length > 0 && roomInfo) {
      const filter = roomInfo.difficultyFilter || "Random";
      let filtered = allProblems;
      if (filter !== "Random") {
        filtered = allProblems.filter(
          (p) => p.difficulty.toLowerCase() === filter.toLowerCase()
        );
      }
      setFilteredProblems(filtered);

      if (!problem) {
        if (roomInfo.currentProblem) {
          setProblem(roomInfo.currentProblem);
        } else if (filtered.length > 0) {
          setProblem(filtered[0]);
        }
      }
    }
  }, [allProblems, roomInfo]);

  // Load language template when language or problem changes
  useEffect(() => {
    if (problem) {
      setCode(problem.starterCode?.[language] || "");
    }
  }, [problem, language]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Join Socket and listen for Room/Battle synchronization events
  useEffect(() => {
    const userObj = JSON.parse(localStorage.getItem("user")) || { name: "Guest" };
    socket.emit("join-room", { roomId, isSpectator, user: userObj });

    socket.on("user-joined", ({ user }) => {
      showToast(`${user?.name || "A coder"} joined the room!`);
      fetchRoomInfo();
    });

    socket.on("user-left", () => {
      showToast("A participant left the room.");
      fetchRoomInfo();
    });

    // Spectators synchronization
    socket.on("spectators-sync", ({ count, list }) => {
      setSpectatorCount(count);
      setSpectators(list);
    });

    // Room Chat message sync
    socket.on("receive-message", (message) => {
      setChatMessages((prev) => [...prev, message]);
    });

    // Player submission activity status sync (for spectators & players)
    socket.on("submission-status-sync", ({ userId, status }) => {
      setPlayerLiveStatuses((prev) => ({
        ...prev,
        [userId]: status
      }));
    });

    // Battle start sync
    socket.on("battle-start-sync", ({ problem, battleId, timer }) => {
      setProblem(problem);
      setBattleId(battleId);
      setTimer(timer || 300);
      setBattleStarted(true);
      setWinner(null);
      setRatingChanges([]);
      setRoundNumber(1);
      setPlayerLiveStatuses({});
      setCode(problem.starterCode?.[language] || "");
      showToast("Battle Mode Started! Code sync disabled.");
    });

    // Battle end sync
    socket.on("battle-end-sync", ({ winner, ratingChanges }) => {
      setWinner(winner);
      setRatingChanges(ratingChanges || []);
      setBattleStarted(false);
      showToast(`Battle ended! Winner: ${winner.name}`);

      // Update ELO rating in current user session if they were part of the duel
      const current = JSON.parse(localStorage.getItem("user"));
      if (current && ratingChanges) {
        const myChange = ratingChanges.find(c => c.userId === current._id);
        if (myChange) {
          current.rating += myChange.change;
          localStorage.setItem("user", JSON.stringify(current));
        }
      }
    });

    // Next round sync
    socket.on("next-round-sync", ({ problem, timer }) => {
      setProblem(problem);
      setTimer(timer || 300);
      setBattleStarted(true);
      setWinner(null);
      setRatingChanges([]);
      setRoundNumber((prev) => prev + 1);
      setPlayerLiveStatuses({});
      setCode(problem.starterCode?.[language] || "");
      showToast(`Round ${roundNumber + 1} started!`);
    });

    fetchRoomInfo();

    return () => {
      socket.emit("leave-room", { roomId });
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("spectators-sync");
      socket.off("receive-message");
      socket.off("submission-status-sync");
      socket.off("battle-start-sync");
      socket.off("battle-end-sync");
      socket.off("next-round-sync");
    };
  }, [roomId, isSpectator]);

  // Code Synchronization: Active ONLY in Collaborative Mode
  useEffect(() => {
    socket.on("sync-code", ({ code }) => {
      if (roomInfo?.roomType === "collab" && !isSpectator) {
        setCode(code);
      }
    });

    return () => {
      socket.off("sync-code");
    };
  }, [roomInfo, isSpectator]);

  // Local battle countdown timer
  useEffect(() => {
    let interval;
    if (battleStarted && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [battleStarted, timer]);

  // Winner 5-second automatic round transition trigger
  useEffect(() => {
    let interval;
    if (roomInfo?.roomType === "battle" && winner && currentUser && winner._id === currentUser._id) {
      setNextRoundCountdown(5);
      interval = setInterval(() => {
        setNextRoundCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            advanceToNextRound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [winner, currentUser, roomInfo]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleLanguageChange = (e) => {
    const selected = e.target.value;
    setLanguage(selected);
    localStorage.setItem("selectedLanguage", selected);
    if (problem) {
      setCode(problem.starterCode?.[selected] || "");
    }
    showToast(`Switched syntax highlighting to ${selected.toUpperCase()}`);
  };

  const handleCodeChange = (value) => {
    if (isSpectator) return;
    setCode(value);

    // Broadcast status to spectators
    socket.emit("submission-status", {
      roomId,
      user: currentUser,
      status: "Coding..."
    });

    if (roomInfo?.roomType === "collab" && !battleStarted) {
      socket.emit("code-change", {
        roomId,
        code: value,
      });
    }
  };

  const handleRunCode = async () => {
    if (isSpectator) return;
    setIsRunning(true);
    setActiveConsoleTab("output");
    setOutput("Executing test runner...");

    socket.emit("submission-status", {
      roomId,
      user: currentUser,
      status: "Running Tests..."
    });

    try {
      const result = await runCode({
        source_code: code,
        language,
        stdin,
        problemId: problem._id,
      });
      if (result.compile_output) {
        setOutput(`Compilation Error:\n${result.compile_output}`);
      } else if (result.stderr) {
        setOutput(`Runtime Error:\n${result.stderr}`);
      } else {
        setOutput(result.stdout || "No Output");
      }

      socket.emit("submission-status", {
        roomId,
        user: currentUser,
        status: "Coding..."
      });
    } catch (error) {
      const msg = error.response?.data?.message || "Execution error.";
      console.log(msg);
      setOutput(`Execution Error: ${msg}`);

      socket.emit("submission-status", {
        roomId,
        user: currentUser,
        status: "Error"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (isSpectator || !problem) return;
    setIsSubmitting(true);
    setActiveConsoleTab("output");
    setOutput("Evaluating submission...");

    socket.emit("submission-status", {
      roomId,
      user: currentUser,
      status: "Evaluating Submission..."
    });

    try {
      const result = await submitCode({
        source_code: code,
        language,
        problemId: problem._id,
      });

      if (result.compile_output) {
        setOutput(`Compilation Error:\n${result.compile_output}`);
      } else if (result.stderr) {
        setOutput(`Runtime Error:\n${result.stderr}`);
      } else {
        setOutput(result.verdict);
      }

      socket.emit("submission-status", {
        roomId,
        user: currentUser,
        status: result.verdict
      });

      if (result.verdict === "Accepted" && roomInfo?.roomType === "battle" && battleStarted && battleId) {
        // Register victory in the database
        const updatedBattle = await submitBattle(battleId);

        if (updatedBattle.winner && currentUser && updatedBattle.winner.toString() === currentUser._id.toString()) {
          // Compute Elo changes to broadcast
          const changes = updatedBattle.participants.map(p => ({
            userId: p.user.toString(),
            change: p.ratingChange
          }));

          // Emit battle end to sync all player interfaces
          socket.emit("battle-end", {
            roomId,
            winner: {
              _id: currentUser._id,
              name: currentUser.name,
              email: currentUser.email,
              rating: currentUser.rating
            },
            ratingChanges: changes
          });

          setWinner(currentUser);
          setRatingChanges(changes);
          setBattleStarted(false);
          showToast("Accepted! Declared winner!");
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Submission failed.";
      console.log(msg);
      setOutput(`Submission Error: ${msg}`);

      socket.emit("submission-status", {
        roomId,
        user: currentUser,
        status: "Error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Select a random problem from the pool (without repeats)
  const selectRandomProblem = (pool, usedList) => {
    const available = pool.filter(p => !usedList.includes(p._id));
    if (available.length === 0) {
      // If all problems are used, clear history and choose from full pool
      const randomProb = pool[Math.floor(Math.random() * pool.length)];
      return { problem: randomProb, reset: true };
    }
    const randomProb = available[Math.floor(Math.random() * available.length)];
    return { problem: randomProb, reset: false };
  };

  const handleStartBattle = async () => {
    if (roomInfo?.roomType !== "battle") return;
    const pool = filteredProblems.length > 0 ? filteredProblems : allProblems;
    if (pool.length === 0) {
      showToast("Coding problems pool is empty.");
      return;
    }

    const { problem: chosen, reset } = selectRandomProblem(pool, recentlyUsedProblems);
    const updatedUsed = reset ? [chosen._id] : [...recentlyUsedProblems, chosen._id];
    setRecentlyUsedProblems(updatedUsed);

    try {
      const battle = await startBattle({
        roomId,
        problemId: chosen._id,
      });

      setBattleId(battle._id);
      setProblem(chosen);
      setTimer(300);
      setBattleStarted(true);
      setWinner(null);
      setRatingChanges([]);
      setRoundNumber(1);
      setPlayerLiveStatuses({});
      setCode(chosen.starterCode?.[language] || "");

      // Broadcast battle start
      socket.emit("battle-start", {
        roomId,
        problem: chosen,
        battleId: battle._id,
        timer: 300,
      });

      showToast("Battle start signal broadcasted!");
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to start battle.";
      console.log(msg);
      showToast(msg);
    }
  };

  const advanceToNextRound = async () => {
    if (roomInfo?.roomType !== "battle") return;
    const pool = filteredProblems.length > 0 ? filteredProblems : allProblems;
    if (pool.length === 0) return;

    const { problem: nextProb, reset } = selectRandomProblem(pool, recentlyUsedProblems);
    const updatedUsed = reset ? [nextProb._id] : [...recentlyUsedProblems, nextProb._id];
    setRecentlyUsedProblems(updatedUsed);

    try {
      const battle = await startBattle({
        roomId,
        problemId: nextProb._id,
      });

      setBattleId(battle._id);
      setProblem(nextProb);
      setTimer(300);
      setBattleStarted(true);
      setWinner(null);
      setRatingChanges([]);
      setRoundNumber((prev) => prev + 1);
      setPlayerLiveStatuses({});
      setCode(nextProb.starterCode?.[language] || "");

      // Sync next round
      socket.emit("next-round", {
        roomId,
        problem: nextProb,
        timer: 300,
      });

      showToast(`Advanced to Round ${roundNumber + 1}!`);
    } catch (error) {
      console.log("Error loading next round:", error);
      showToast("Error auto-starting next round.");
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentUser) return;
    if (isSpectator) {
      showToast("Spectators cannot send chat messages.");
      return;
    }

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const messagePayload = {
      text: chatInput,
      username: currentUser.name,
      timestamp: formattedTime
    };

    socket.emit("send-message", {
      roomId,
      message: messagePayload
    });

    setChatInput("");
  };

  const copyRoomIdToClipboard = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedRoomId(true);
    showToast("Room ID copied!");
    setTimeout(() => setCopiedRoomId(false), 2000);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const getDifficultyColor = (diff) => {
    if (!diff) return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
    if (diff.toLowerCase() === "easy") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (diff.toLowerCase() === "medium") return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  const p1 = players[0] || { name: "Player 1", rating: 1200 };
  const p2 = players[1] || { name: "Player 2", rating: 1200 };

  return (
    <div className="h-screen bg-[#070709] text-zinc-150 flex flex-col overflow-hidden font-sans relative">
      {/* Confetti Drops victory */}
      {winner && <ConfettiBurst />}

      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-55 flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-white/[0.04] text-amber-450 text-xs font-semibold rounded-xl shadow-2xl backdrop-blur-xl"
          >
            <Info className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER BATTLE ARENA OR COLLAB IDE */}
      {roomInfo?.roomType === "battle" ? (
        
        // ==========================================
        // 1. esports battle arena layout
        // ==========================================
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          
          {/* Header VS layout */}
          <header className="border-b border-white/[0.03] bg-zinc-950/60 backdrop-blur-xl px-6 py-3 flex items-center justify-between shrink-0 z-40 relative">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center justify-center p-2 rounded-xl text-zinc-550 hover:text-zinc-200 hover:bg-white/[0.02] border border-white/[0.04] active:scale-95 transition-all cursor-pointer shrink-0"
                title="Leave Arena Room"
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </button>
              
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-zinc-650 font-mono tracking-widest uppercase leading-none font-bold">Match ID</span>
                <span className="text-[11px] font-mono text-zinc-500 mt-1 leading-none">{roomId}</span>
              </div>
            </div>

            {/* Middle player profiles HUD cards */}
            <div className="flex items-center gap-6">
              {/* Player 1 details */}
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1 bg-white/[0.01] border border-white/[0.04] rounded-xl shadow-sm">
                <div className="w-6.5 h-6.5 rounded-lg bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center text-[8.5px] font-bold text-indigo-400 uppercase font-mono">
                  {p1.name.substring(0, 2)}
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-xs font-bold text-zinc-350">{p1.name}</span>
                  <span className="text-[8px] text-zinc-600 font-mono mt-1 font-bold uppercase tracking-widest">{p1.rating} Elo</span>
                </div>
              </div>

              {/* Central VS emblem HUD timer */}
              <div className="flex items-center gap-3.5">
                <span className="text-[10px] text-zinc-650 font-mono font-bold tracking-widest uppercase">VS</span>
                <CircularTimerHUD seconds={timer} isActive={battleStarted} max={300} />
                <span className="text-[9px] text-zinc-550 font-bold bg-white/[0.01] border border-white/[0.04] px-2 py-0.5 rounded uppercase font-mono">
                  Round #{roundNumber}
                </span>
              </div>

              {/* Player 2 details */}
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1 bg-white/[0.01] border border-white/[0.04] rounded-xl shadow-sm">
                <div className="flex flex-col text-right leading-none">
                  <span className="text-xs font-bold text-zinc-350">{p2.name}</span>
                  <span className="text-[8px] text-zinc-600 font-mono mt-1 font-bold uppercase tracking-widest">{p2.rating} Elo</span>
                </div>
                <div className="w-6.5 h-6.5 rounded-lg bg-rose-500/10 border border-rose-500/15 flex items-center justify-center text-[8.5px] font-bold text-rose-455 uppercase font-mono">
                  {p2.name.substring(0, 2)}
                </div>
              </div>
            </div>

            {/* Right launcher actions */}
            <div className="flex items-center gap-3">
              {!battleStarted && !isSpectator && (
                <button
                  onClick={handleStartBattle}
                  disabled={!problem}
                  className="px-4.5 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-455 disabled:opacity-50 text-zinc-950 font-black text-xs rounded-xl active:scale-97 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/5 shrink-0"
                >
                  <Swords className="w-4 h-4" />
                  Start Duel
                </button>
              )}
              {battleStarted && (
                <div className="px-3.5 py-1.5 rounded-xl border border-rose-500/20 text-rose-455 text-[10.5px] font-bold bg-rose-500/5 flex items-center gap-1.5 shrink-0">
                  <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                  Battle Dueling
                </div>
              )}
            </div>
          </header>

          {/* Dueling Panels */}
          <div className="flex-1 flex overflow-hidden w-full relative">
            <button 
              onClick={() => setCol1Collapsed(!col1Collapsed)}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-40 bg-zinc-950 border border-white/[0.04] p-1.5 rounded-lg text-zinc-650 hover:text-zinc-200 cursor-pointer hidden md:block"
            >
              <ChevronLeft className={`w-3.5 h-3.5 transition-transform ${col1Collapsed ? "rotate-180" : ""}`} />
            </button>
            <button 
              onClick={() => setCol3Collapsed(!col3Collapsed)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-40 bg-zinc-950 border border-white/[0.04] p-1.5 rounded-lg text-zinc-650 hover:text-zinc-200 cursor-pointer hidden md:block"
            >
              <ChevronLeft className={`w-3.5 h-3.5 transition-transform ${col3Collapsed ? "" : "rotate-180"}`} />
            </button>

            {/* Left Column Problem panel */}
            <AnimatePresence initial={false}>
              {!col1Collapsed && (
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "28%", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="min-w-[280px] p-5 overflow-y-auto border-r border-white/[0.03] bg-zinc-950/20 flex flex-col gap-6 select-none shrink-0"
                >
                  {problem ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] uppercase px-2.5 py-0.5 rounded font-bold border font-mono ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                        <span className="text-[8px] text-zinc-550 font-bold font-mono uppercase bg-white/[0.01] border border-white/[0.03] px-2 py-0.5 rounded">
                          Lobby Duel
                        </span>
                      </div>

                      <div className="space-y-3">
                        <h2 className="text-base font-bold text-zinc-150 leading-snug">{problem.title}</h2>
                        {problem.tags && problem.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {problem.tags.map((tag, idx) => (
                              <span key={idx} className="text-[8px] font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-1.5 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="text-zinc-450 text-xs leading-relaxed whitespace-pre-line font-medium pr-1">
                          {problem.statement}
                        </div>
                      </div>

                      {problem.constraints && (
                        <div className="space-y-2 pt-4.5 border-t border-white/[0.03]">
                          <h4 className="text-[9px] font-bold uppercase tracking-wider text-zinc-655 flex items-center gap-1.5">
                            <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                            Constraints
                          </h4>
                          <pre className="text-zinc-500 text-[10.5px] pl-4 font-mono leading-relaxed bg-white/[0.01] p-2 rounded-lg border border-white/[0.02] overflow-x-auto">
                            {problem.constraints}
                          </pre>
                        </div>
                      )}

                      {problem.visibleExamples && problem.visibleExamples.length > 0 && (
                        <div className="space-y-4 pt-4.5 border-t border-white/[0.03]">
                          <h4 className="text-[9px] font-bold uppercase tracking-wider text-zinc-650">Visible Examples</h4>
                          {problem.visibleExamples.map((ex, idx) => (
                            <div key={idx} className="space-y-2.5 bg-white/[0.01] border border-white/[0.03] p-3.5 rounded-xl text-xs">
                              <span className="text-[8.5px] font-bold text-amber-500 uppercase tracking-widest">Example {idx + 1}</span>
                              <div className="space-y-1.5 font-mono text-[10.5px] leading-relaxed">
                                <div className="text-zinc-350"><span className="text-zinc-650 font-sans font-bold">Input:</span> {ex.input}</div>
                                <div className="text-zinc-350"><span className="text-zinc-650 font-sans font-bold">Output:</span> {ex.output}</div>
                                {ex.explanation && (
                                  <div className="text-zinc-500 font-sans mt-2 text-[10.5px] leading-relaxed">
                                    <span className="text-zinc-650 font-bold">Explanation:</span> {ex.explanation}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-700">
                      <ShieldAlert className="w-8 h-8 text-zinc-800 mb-2" />
                      <p className="text-[10px] font-semibold">Preloading arena challenge details...</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Monaco Workspace center */}
            <div className="flex-1 flex flex-col bg-[#08080a] border-r border-white/[0.03] overflow-hidden min-w-0">
              
              <div className="flex-1 relative flex flex-col overflow-hidden">
                <div className="bg-zinc-950 px-4 py-2.5 border-b border-white/[0.03] flex items-center justify-between shrink-0">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500">
                    <Code className="w-4 h-4 text-indigo-400" />
                    solution.{language === "cpp" ? "cpp" : language === "python" ? "py" : "java"}
                  </span>
                  
                  <select
                    value={language}
                    onChange={handleLanguageChange}
                    className="bg-[#08080a] border border-white/[0.04] text-zinc-450 text-[11.5px] font-bold font-mono px-2 py-1 rounded-lg outline-none cursor-pointer"
                  >
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                  </select>
                </div>

                <div className="flex-1 relative">
                  <div className="absolute inset-0">
                    <Editor
                      height="100%"
                      defaultLanguage="cpp"
                      language={language}
                      theme="vs-dark"
                      value={code}
                      onChange={handleCodeChange}
                      options={{
                        readOnly: isSpectator,
                        fontSize: 13,
                        fontFamily: "JetBrains Mono, monospace",
                        minimap: { enabled: false },
                        scrollbar: {
                          vertical: "visible",
                          horizontal: "visible",
                          verticalScrollbarSize: 6,
                          horizontalScrollbarSize: 6,
                        },
                        lineNumbers: "on",
                        folding: true,
                        automaticLayout: true,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Console logs output */}
              <div className="h-60 bg-zinc-950 flex flex-col shrink-0 border-t border-white/[0.03]">
                <div className="bg-zinc-950 border-b border-white/[0.03] px-4 flex items-center justify-between shrink-0">
                  <div className="flex gap-1.5">
                    {["input", "output"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveConsoleTab(tab)}
                        className={`px-3 py-2.5 text-[11px] font-bold border-b-2 outline-none transition-all cursor-pointer ${activeConsoleTab === tab ? "border-amber-500 text-zinc-200" : "border-transparent text-zinc-650 hover:text-zinc-450"}`}
                      >
                        {tab === "input" ? "Custom Input (stdin)" : "Verdict Logs"}
                      </button>
                    ))}
                  </div>

                  {!isSpectator && (
                    <div className="flex gap-2 py-1.5">
                      <button
                        onClick={handleRunCode}
                        disabled={isRunning || isSubmitting}
                        className="px-3 py-1.5 bg-[#08080a] border border-white/[0.04] hover:bg-white/[0.03] text-zinc-300 text-[11.5px] font-bold rounded-lg transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {isRunning ? (
                          <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <><Play className="w-3 h-3 fill-zinc-450 text-zinc-450" />Run</>
                        )}
                      </button>
                      
                      <button
                        onClick={handleSubmitCode}
                        disabled={isRunning || isSubmitting || !problem}
                        className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white text-[11.5px] font-bold rounded-lg shadow-md active:scale-95 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <><CheckCircle2 className="w-3.5 h-3.5" />Submit</>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-4.5 overflow-y-auto font-mono text-[12px] bg-[#070709]">
                  {activeConsoleTab === "input" ? (
                    <textarea
                      className="w-full h-full bg-transparent text-zinc-300 placeholder-zinc-800 focus:outline-none resize-none font-mono"
                      placeholder={isSpectator ? "Spectator console is muted..." : "Provide custom inputs to pass to stdin stream..."}
                      value={stdin}
                      readOnly={isSpectator}
                      onChange={(e) => setStdin(e.target.value)}
                    />
                  ) : (
                    <div className="h-full">
                      {output ? (
                        <div className={`p-3.5 rounded-xl border leading-relaxed ${output === "Accepted" ? "bg-emerald-500/10 border-emerald-500/15 text-emerald-400 animate-verdict-bounce" : "bg-white/[0.01] border-white/[0.04] text-zinc-300 animate-verdict-shake"}`}>
                          {output === "Accepted" ? (
                            <div className="flex items-center gap-1.5 mb-1.5 font-bold text-emerald-450 text-xs">
                              <CheckCircle2 className="w-4.5 h-4.5" />
                              <span>Accepted Verdict</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 mb-1.5 font-bold text-rose-455 text-xs">
                              <Terminal className="w-4.5 h-4.5" />
                              <span>Verdict Log Output</span>
                            </div>
                          )}
                          <pre className="whitespace-pre-wrap break-all leading-relaxed text-[11.5px] font-mono">{output}</pre>
                        </div>
                      ) : (
                        <div className="text-zinc-755 flex flex-col items-center justify-center h-full gap-1">
                          <Terminal className="w-4.5 h-4.5 text-zinc-800" />
                          <p className="text-[10px]">Compilation outcomes logs will display here.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Competitor Status & Event Telemetry feed */}
            <AnimatePresence initial={false}>
              {!col3Collapsed && (
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "24%", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="min-w-[240px] p-4 overflow-y-auto bg-zinc-950/40 flex flex-col gap-4 shrink-0 font-sans"
                >
                  {/* Players live indicators */}
                  <div className="bg-[#08080a] border border-white/[0.04] p-4 rounded-xl flex flex-col max-h-[220px]">
                    <span className="text-[9px] text-zinc-650 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      Live Matchups ({players.length})
                    </span>
                    <div className="space-y-2 overflow-y-auto pr-0.5">
                      {players.map((pl) => {
                        const status = playerLiveStatuses[pl._id] || "Coding...";
                        const isWon = winner && winner._id === pl._id;
                        return (
                          <div key={pl._id} className="p-2 bg-white/[0.01] border border-white/[0.03] rounded-lg flex items-center justify-between text-[11px]">
                            <div className="flex flex-col min-w-0 text-left">
                              <span className={`font-bold truncate w-[90px] ${isWon ? "text-amber-400" : "text-zinc-300"}`}>{pl.name}</span>
                              {battleStarted && (
                                <span className="text-[8.5px] text-zinc-550 font-mono mt-0.5">{status}</span>
                              )}
                            </div>
                            <span className="font-mono text-[9px] font-bold text-zinc-500 bg-black/45 px-1.5 py-0.5 rounded border border-white/[0.03]">
                              ★ {pl.rating ?? 1200}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Spectators listing */}
                  {(isSpectator || spectators.length > 0) && (
                    <div className="bg-[#08080a] border border-white/[0.04] p-4 rounded-xl flex flex-col max-h-[140px]">
                      <span className="text-[9px] text-zinc-655 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-zinc-650" />
                        Audience ({spectators.length})
                      </span>
                      <div className="space-y-1.5 overflow-y-auto pr-0.5 text-[10px] text-zinc-500 text-left">
                        {spectators.map((s, idx) => (
                          <div key={idx} className="truncate">
                            • {s.name} <span className="text-zinc-650 font-mono">({s.rating})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Shared arena chat */}
                  <div className="bg-[#08080a] border border-white/[0.04] p-4.5 rounded-xl flex-1 flex flex-col min-h-[220px] overflow-hidden">
                    <span className="text-[9px] text-zinc-650 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                      Arena Chat
                    </span>

                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 mb-2.5 min-h-[100px]">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className="text-xs text-left">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-zinc-400">{msg.username}</span>
                            <span className="text-[8.5px] text-zinc-655 font-mono">{msg.timestamp}</span>
                          </div>
                          <p className="text-zinc-500 leading-relaxed font-semibold mt-0.5">{msg.text}</p>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="flex gap-1.5 shrink-0 border-t border-white/[0.03] pt-2">
                      <input
                        type="text"
                        placeholder={isSpectator ? "Audience muted" : "Send logs..."}
                        disabled={isSpectator}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-transparent border border-white/[0.04] focus:border-indigo-500/40 rounded-xl text-xs outline-none placeholder-zinc-750 text-zinc-350"
                      />
                      <button
                        type="submit"
                        disabled={isSpectator || !chatInput.trim()}
                        className="p-1.8 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Full Screen Victory / Loss overlay screen */}
          <AnimatePresence>
            {winner && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-zinc-950/95 backdrop-blur-xl flex flex-col items-center justify-center gap-6 z-50 p-6"
              >
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-500/[0.02] blur-[150px] pointer-events-none" />
                
                <motion.div
                  initial={{ scale: 0.9, y: 15 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="max-w-md w-full bg-[#08080a] border border-white/[0.04] p-8 rounded-3xl shadow-2xl relative overflow-hidden text-center space-y-6"
                >
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
                  
                  <div className="flex flex-col items-center gap-2">
                    <Award className="w-12 h-12 text-amber-500 animate-bounce" />
                    <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Match Settled</span>
                    <h2 className="text-xl font-black text-zinc-150 mt-1.5 flex items-center justify-center gap-1.5">
                      {winner.name} Wins Duel
                      <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                    </h2>
                  </div>

                  {ratingChanges.length > 0 && (
                    <div className="border-y border-white/[0.03] py-4.5 space-y-2 text-xs font-semibold text-zinc-400 text-left">
                      <span className="text-[8.5px] text-zinc-650 font-bold uppercase tracking-wider block mb-2">Elo adjustment breakdown</span>
                      {ratingChanges.map((change, idx) => {
                        const pl = players.find(p => p._id === change.userId) || spectators.find(s => s.userId === change.userId);
                        const isPos = change.change > 0;
                        return (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="truncate w-[130px] font-bold">{pl?.name || "Competitor"}</span>
                            <span className={isPos ? "text-emerald-450" : "text-rose-455"}>
                              {isPos ? `+${change.change}` : change.change} Elo rating
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {currentUser && winner._id === currentUser._id && nextRoundCountdown > 0 && (
                    <div className="flex items-center justify-between text-[10px] text-amber-500 font-bold pt-2">
                      <span>Incrementing next round...</span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                        {nextRoundCountdown}s
                      </span>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      ) : (
        
        // ==========================================
        // 2. Cursor-inspired Pair Programming sync layout
        // ==========================================
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          
          <div className="absolute top-0 right-1/4 w-[450px] h-[300px] bg-indigo-500/[0.015] blur-[120px] pointer-events-none z-10" />

          {/* Minimal workspace header */}
          <header className="border-b border-white/[0.03] bg-zinc-950/70 backdrop-blur-xl px-5 py-3.5 flex items-center justify-between shrink-0 z-40 relative">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center justify-center p-2 rounded-xl text-zinc-550 hover:text-zinc-200 hover:bg-white/[0.02] border border-white/[0.04] active:scale-95 transition-all cursor-pointer shrink-0"
                title="Return to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex flex-col text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-zinc-200 leading-none">Collaborative Studio</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/15 text-[8.5px] text-emerald-455 font-bold uppercase tracking-wider animate-pulse font-mono">
                    Live Sync
                  </span>
                </div>
                <button
                  onClick={copyRoomIdToClipboard}
                  className="text-[9.5px] text-zinc-600 hover:text-zinc-350 font-mono mt-1 flex items-center gap-1 leading-none group cursor-pointer"
                >
                  <span>Room ID: {roomId}</span>
                  {copiedRoomId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100" />}
                </button>
              </div>
            </div>

            {/* Active presence bubble list */}
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-1.5 overflow-hidden">
                {players.map((pl) => (
                  <div 
                    key={pl._id} 
                    className="w-6.5 h-6.5 rounded-full border border-zinc-950 bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center text-[7.5px] font-black text-white uppercase ring-2 ring-emerald-500/20"
                    title={`${pl.name} (${pl.rating || 1200} Elo)`}
                  >
                    {pl.name.substring(0, 2)}
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-zinc-550 font-semibold font-mono hidden sm:block">
                {players.length} online
              </span>
            </div>
          </header>

          {/* Pair Programming split panels */}
          <div className="flex-1 flex overflow-hidden w-full relative z-30">
            
            {/* Sidebar toggle buttons */}
            <button 
              onClick={() => setCol1Collapsed(!col1Collapsed)}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-40 bg-zinc-950 border border-white/[0.04] p-1.5 rounded-lg text-zinc-655 hover:text-zinc-200 cursor-pointer hidden md:block"
            >
              <ChevronLeft className={`w-3.5 h-3.5 transition-transform ${col1Collapsed ? "rotate-180" : ""}`} />
            </button>
            <button 
              onClick={() => setCol3Collapsed(!col3Collapsed)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-40 bg-zinc-950 border border-white/[0.04] p-1.5 rounded-lg text-zinc-655 hover:text-zinc-200 cursor-pointer hidden md:block"
            >
              <ChevronLeft className={`w-3.5 h-3.5 transition-transform ${col3Collapsed ? "" : "rotate-180"}`} />
            </button>

            {/* Panel 1: Problem statements */}
            <AnimatePresence initial={false}>
              {!col1Collapsed && (
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "26%", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="min-w-[280px] p-5 overflow-y-auto border-r border-white/[0.03] bg-[#08080a]/30 flex flex-col gap-6 select-none shrink-0"
                >
                  {problem ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] uppercase px-2.5 py-0.5 rounded font-bold border font-mono ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                        <span className="text-[8px] text-zinc-550 font-bold font-mono uppercase bg-white/[0.01] border border-white/[0.03] px-2 py-0.5 rounded">
                          Lobby challenge
                        </span>
                      </div>

                      <div className="space-y-2.5 text-left">
                        <h3 className="text-sm font-bold text-zinc-150 leading-snug">{problem.title}</h3>
                        <p className="text-zinc-450 text-[11.5px] leading-relaxed font-semibold">
                          {problem.statement}
                        </p>
                      </div>

                      {problem.constraints && (
                        <div className="space-y-2 pt-4.5 border-t border-white/[0.03]">
                          <span className="text-[8.5px] font-bold text-zinc-650 uppercase tracking-widest block text-left">Constraints</span>
                          <pre className="text-zinc-500 text-[10px] font-mono leading-relaxed bg-white/[0.01] p-2.5 rounded-xl border border-white/[0.02] overflow-x-auto text-left">
                            {problem.constraints}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-750">
                      <UserCheck className="w-8 h-8 text-zinc-800 mb-2.5" />
                      <p className="text-[10px]">Loading peer programming challenge...</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Panel 2: Monaco Editor space */}
            <div className="flex-1 flex flex-col bg-[#0b0b0d] border-r border-white/[0.03] overflow-hidden min-w-0">
              
              {/* IDE toolbar panel */}
              <div className="bg-zinc-950 px-4 py-2.5 border-b border-white/[0.03] flex items-center justify-between shrink-0">
                <span className="text-[11px] font-bold text-zinc-500 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-indigo-400" />
                  sync-buffer.{language === "cpp" ? "cpp" : language === "python" ? "py" : "java"}
                </span>

                <div className="flex items-center gap-2">
                  <select
                    value={language}
                    onChange={handleLanguageChange}
                    className="bg-[#08080a] border border-white/[0.04] text-zinc-455 text-[11.5px] font-bold font-mono px-2 py-1 rounded-lg outline-none cursor-pointer"
                  >
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                  </select>
                </div>
              </div>

              {/* Editor viewport */}
              <div className="flex-1 relative">
                <div className="absolute inset-0">
                  <Editor
                    height="100%"
                    defaultLanguage="cpp"
                    language={language}
                    theme="vs-dark"
                    value={code}
                    onChange={handleCodeChange}
                    options={{
                      readOnly: isSpectator,
                      fontSize: 13,
                      fontFamily: "JetBrains Mono, monospace",
                      minimap: { enabled: false },
                      scrollbar: {
                        vertical: "visible",
                        horizontal: "visible",
                        verticalScrollbarSize: 6,
                        horizontalScrollbarSize: 6,
                      },
                      lineNumbers: "on",
                      folding: true,
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>

              {/* Console drawer */}
              <div className="h-60 bg-zinc-950 flex flex-col shrink-0 border-t border-white/[0.03]">
                <div className="bg-zinc-950 border-b border-white/[0.03] px-4 flex items-center justify-between shrink-0">
                  <span className="text-[11px] font-bold py-3.5 border-b-2 border-amber-500 text-zinc-200 uppercase tracking-widest">
                    Execution Output
                  </span>

                  {!isSpectator && (
                    <button
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="px-3.5 py-1.5 bg-[#08080a] border border-white/[0.04] hover:bg-white/[0.03] text-zinc-300 text-[11.5px] font-bold rounded-lg transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {isRunning ? (
                        <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <><Play className="w-3 h-3 fill-zinc-450 text-zinc-450" />Run Solution</>
                      )}
                    </button>
                  )}
                </div>

                <div className="flex-1 p-4.5 overflow-y-auto font-mono text-[12px] bg-[#070709]">
                  {output ? (
                    <div className="p-3.5 rounded-xl border border-white/[0.03] bg-white/[0.01]">
                      <pre className="whitespace-pre-wrap break-all leading-relaxed text-[11.5px] font-mono text-zinc-355 text-left">{output}</pre>
                    </div>
                  ) : (
                    <div className="text-zinc-750 flex flex-col items-center justify-center h-full gap-1">
                      <Terminal className="w-4.5 h-4.5 text-zinc-800 animate-pulse" />
                      <p className="text-[10px]">Verification compilations output will sync here.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Panel 3: Shared telemetry and Slack/Discord chat logs */}
            <AnimatePresence initial={false}>
              {!col3Collapsed && (
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "24%", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="min-w-[240px] p-4 bg-zinc-950/45 flex flex-col gap-4 shrink-0 overflow-hidden h-full"
                >
                  {/* Contributors list */}
                  <div className="bg-[#08080a] border border-white/[0.04] p-4 rounded-xl flex flex-col max-h-[160px] shrink-0">
                    <span className="text-[9px] text-zinc-650 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      Workspace peers
                    </span>
                    <div className="space-y-1.5 overflow-y-auto pr-0.5 text-xs font-semibold text-zinc-350 text-left">
                      {players.map((pl) => (
                        <div key={pl._id} className="flex items-center gap-2 p-2 bg-white/[0.01] border border-white/[0.03] rounded-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="truncate">{pl.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Slack-like Chat panel */}
                  <div className="bg-[#08080a] border border-white/[0.04] p-4.5 rounded-xl flex-1 flex flex-col overflow-hidden min-h-0">
                    <span className="text-[9px] text-zinc-650 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 shrink-0">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                      Slack Stream
                    </span>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 mb-2.5 min-h-[100px]">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className="text-xs text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-zinc-400">{msg.username}</span>
                            <span className="text-[8.5px] text-zinc-650 font-mono">{msg.timestamp}</span>
                          </div>
                          <p className="text-zinc-555 leading-relaxed font-semibold mt-0.5">{msg.text}</p>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="flex gap-1.5 shrink-0 border-t border-white/[0.03] pt-2">
                      <input
                        type="text"
                        placeholder={isSpectator ? "Audience muted" : "Type log line..."}
                        disabled={isSpectator}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-transparent border border-white/[0.04] focus:border-indigo-500/40 rounded-xl text-xs outline-none placeholder-zinc-750 text-zinc-350"
                      />
                      <button
                        type="submit"
                        disabled={isSpectator || !chatInput.trim()}
                        className="p-1.8 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

      )}
    </div>
  );
}

function UserCheck(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );
}

export default Room;
