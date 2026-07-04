import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Editor from "@monaco-editor/react";
import socket from "../socket/socket";
import { getProblems } from "../services/problemService";
import { runCode, submitCode } from "../services/codeService";
import { startBattle, submitBattle } from "../services/battleService";
import { getRoomDetails } from "../services/roomService";
import {
  Swords, Play, CheckCircle2, ArrowLeft, Copy, Check, Timer,
  Terminal, AlertCircle, XCircle, ChevronRight, Eye, Users,
  Code, Flame, Sparkles, Award, RotateCcw, Send, MessageSquare, ShieldAlert,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";



function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Role detection: check if joined as spectator
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

      // Use the synchronized problem from the room details, or fallback to first filtered match
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
    if (winner && currentUser && winner._id === currentUser._id) {
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
  }, [winner, currentUser]);

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

      if (result.verdict === "Accepted" && battleStarted && battleId) {
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

  const copyInputToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedInput(true);
    showToast("Sample input copied!");
    setTimeout(() => setCopiedInput(false), 2000);
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

  return (
    <div className="h-screen bg-[#070709] text-zinc-100 flex flex-col overflow-hidden font-sans">

      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-55 flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-amber-400 text-xs font-semibold rounded-xl shadow-2xl"
          >
            <Info className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Status Bar */}
      <header className="border-b border-zinc-850 bg-zinc-950 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800/60 active:scale-95 transition-all"
            title="Leave Arena Room"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold bg-gradient-to-r from-amber-400 via-rose-450 to-indigo-400 bg-clip-text text-transparent">
                AlgoSync Space
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${battleStarted ? "bg-rose-500 animate-ping" : "bg-emerald-500 animate-pulse"}`} />
            </div>
            <button
              onClick={copyRoomIdToClipboard}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 font-mono mt-0.5 group"
            >
              <span>Room ID: {roomId}</span>
              {copiedRoomId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />}
            </button>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-4">
          {isSpectator && (
            <div className="px-3.5 py-1.5 rounded-xl border border-indigo-500/20 text-indigo-400 text-xs font-bold bg-indigo-500/5 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>Spectator Mode</span>
            </div>
          )}

          {!battleStarted && !isSpectator && (
            <button
              onClick={handleStartBattle}
              disabled={!problem}
              className="relative px-5 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/15 active:scale-97 transition-all flex items-center gap-2 group cursor-pointer"
            >
              <Swords className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>Launch Battle Mode</span>
            </button>
          )}

          {battleStarted && !isSpectator && (
            <div className="px-3.5 py-1.5 rounded-xl border border-rose-500/20 text-rose-455 text-xs font-bold bg-rose-500/5 flex items-center gap-2">
              <Flame className="w-4 h-4 animate-pulse" />
              <span>Duel In Progress</span>
            </div>
          )}
        </div>
      </header>

      {/* Redesigned 3-Column layout */}
      <div className="flex-1 flex overflow-hidden w-full">

        {/* ======================================================== */}
        {/* COLUMN 1: LEFT PANEL - PROBLEM STATEMENT (30% WIDTH)     */}
        {/* ======================================================== */}
        <div className="w-[30%] min-w-[280px] p-5 overflow-y-auto border-r border-zinc-850 bg-zinc-950/20 flex flex-col gap-6">
          {problem ? (
            <div className="space-y-6">

              {/* Difficulty & Classification */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full font-bold border font-mono ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty || "Medium"}
                </span>
                <span className="text-[10px] text-zinc-550 font-bold font-mono uppercase bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded">
                  Interview
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-zinc-150">{problem.title}</h1>

                {/* Tags mapping */}
                {problem.tags && problem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {problem.tags.map((tag, idx) => (
                      <span key={idx} className="text-[9px] font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 text-zinc-400 text-xs leading-relaxed whitespace-pre-line font-medium">
                  {problem.statement}
                </div>
              </div>

              {/* Constraints */}
              {problem.constraints && (
                <div className="space-y-2 pt-4 border-t border-zinc-900">
                  <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                    Constraints
                  </h3>
                  <pre className="text-zinc-450 text-xs pl-5 font-mono leading-relaxed bg-zinc-900/10 p-2 rounded-lg">
                    {problem.constraints}
                  </pre>
                </div>
              )}

              {/* Examples */}
              {problem.visibleExamples && problem.visibleExamples.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-zinc-900">
                  <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">
                    Examples
                  </h3>
                  {problem.visibleExamples.map((ex, idx) => (
                    <div key={idx} className="space-y-2 bg-zinc-900/30 border border-zinc-850/60 p-3.5 rounded-xl text-xs">
                      <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Example {idx + 1}</div>
                      <div className="space-y-1 font-mono text-[11px] leading-relaxed">
                        <div className="text-zinc-350"><span className="text-zinc-550 font-sans font-bold">Input:</span> {ex.input}</div>
                        <div className="text-zinc-350"><span className="text-zinc-550 font-sans font-bold">Output:</span> {ex.output}</div>
                        {ex.explanation && (
                          <div className="text-zinc-400 font-sans mt-2 text-[11px] leading-relaxed">
                            <span className="text-zinc-550 font-bold">Explanation:</span> {ex.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-550">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-[11px] font-semibold">Preloading challenge...</p>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* COLUMN 2: CENTER PANEL - EDITOR & CONSOLE (45% WIDTH)    */}
        {/* ======================================================== */}
        <div className="w-[45%] flex flex-col bg-[#0b0b0d] border-r border-zinc-850">

          {/* Monaco Editor Container */}
          <div className="flex-1 relative flex flex-col">
            {/* Editor Control Headers */}
            <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-850 flex items-center justify-between shrink-0">
              <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-455">
                <Code className="w-4 h-4 text-indigo-400" />
                workspace.{language === "cpp" ? "cpp" : language === "python" ? "py" : "java"}
              </span>

              {/* Language Selector Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-550 font-bold uppercase">Language</span>
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-350 text-[11px] font-bold font-mono px-2 py-0.5 rounded outline-none focus:border-zinc-700 cursor-pointer"
                >
                  <option value="cpp">C++ (GCC 17)</option>
                  <option value="java">Java (OpenJDK 11)</option>
                  <option value="python">Python (3.8)</option>
                </select>
              </div>
            </div>

            {/* Monaco Component */}
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
                      verticalScrollbarSize: 8,
                      horizontalScrollbarSize: 8,
                    },
                    lineNumbers: "on",
                    lineDecorationsWidth: 10,
                    folding: true,
                    automaticLayout: true,
                    smoothCaretAnimation: "on",
                    cursorBlinking: "smooth",
                    renderLineHighlight: "all",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Console Area */}
          <div className="h-64 bg-zinc-950 flex flex-col shrink-0">
            {/* Console Control Tabs */}
            <div className="bg-zinc-950 border-b border-zinc-850 px-4 flex items-center justify-between shrink-0">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveConsoleTab("input")}
                  className={`px-3 py-2 text-xs font-semibold border-b-2 outline-none transition-all cursor-pointer ${activeConsoleTab === "input" ? "border-amber-500 text-zinc-200" : "border-transparent text-zinc-500 hover:text-zinc-350"}`}
                >
                  Custom Input (stdin)
                </button>
                <button
                  onClick={() => setActiveConsoleTab("output")}
                  className={`px-3 py-2 text-xs font-semibold border-b-2 outline-none transition-all cursor-pointer ${activeConsoleTab === "output" ? "border-amber-500 text-zinc-200" : "border-transparent text-zinc-500 hover:text-zinc-350"}`}
                >
                  Output Console
                </button>
              </div>

              {/* Execution Action buttons */}
              {!isSpectator && (
                <div className="flex gap-2 py-1.5">
                  <button
                    onClick={handleRunCode}
                    disabled={isRunning || isSubmitting}
                    className="px-3 py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-bold rounded-lg transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isRunning ? (
                      <div className="w-3 h-3 border border-zinc-300 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-zinc-400 fill-zinc-400" />
                        Run Code
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSubmitCode}
                    disabled={isRunning || isSubmitting || !problem}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-600/10 transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Submit Code
                      </>
                    )}
                  </button>
                </div>
              )}

              {isSpectator && (
                <span className="text-[10px] text-zinc-550 font-bold uppercase py-2">
                  Read Only Console
                </span>
              )}
            </div>

            {/* Console Content Box */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs">
              {activeConsoleTab === "input" ? (
                <textarea
                  className="w-full h-full bg-zinc-950 text-zinc-300 placeholder-zinc-750 focus:outline-none resize-none"
                  placeholder={isSpectator ? "Spectators cannot input data stream..." : "Enter inputs to pass to stdin stream..."}
                  value={stdin}
                  readOnly={isSpectator}
                  onChange={(e) => setStdin(e.target.value)}
                />
              ) : (
                <div className="h-full">
                  {output ? (
                    <div className={`p-3 rounded-xl border ${output === "Accepted" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : output.startsWith("Wrong") || output.startsWith("Compilation") || output.startsWith("Error") ? "bg-rose-500/10 border-rose-500/20 text-rose-450" : "bg-zinc-900 border-zinc-800 text-zinc-350"}`}>
                      {output === "Accepted" ? (
                        <div className="flex items-center gap-2 mb-1 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Verdict: ACCEPTED</span>
                        </div>
                      ) : output.startsWith("Wrong") || output.startsWith("Compilation") || output.startsWith("Error") ? (
                        <div className="flex items-center gap-2 mb-1 font-bold">
                          <XCircle className="w-4 h-4 text-rose-400" />
                          <span>Verdict: {output.toUpperCase()}</span>
                        </div>
                      ) : null}
                      <pre className="whitespace-pre-wrap break-all leading-relaxed font-mono">{output}</pre>
                    </div>
                  ) : (
                    <div className="text-zinc-650 flex flex-col items-center justify-center h-full gap-1">
                      <Terminal className="w-4 h-4 text-zinc-800" />
                      <p className="text-[10px]">Console results will display here.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* ======================================================== */}
        {/* COLUMN 3: RIGHT PANEL - METADATA, CHAT & STATS (25% W)   */}
        {/* ======================================================== */}
        <div className="w-[25%] min-w-[250px] p-4.5 overflow-y-auto bg-zinc-950/40 flex flex-col gap-4">

          {/* Battle Timer Display */}
          <div className="bg-zinc-950/80 border border-zinc-850 p-4 rounded-xl shadow-xl flex flex-col items-center text-center">
            <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Timer</span>
            {roomInfo?.roomType === "collab" ? (
              <div className="flex flex-col items-center mt-2">
                <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-850 text-xs font-semibold text-zinc-400">
                  Collab Active
                </div>
              </div>
            ) : battleStarted ? (
              <div className="flex flex-col items-center mt-2">
                <div className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg border text-lg font-bold font-mono ${timer < 60 ? "bg-rose-500/10 border-rose-500/30 text-rose-400 pulse-glow" : timer < 180 ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-zinc-900 border-zinc-800 text-emerald-400"}`}>
                  <Timer className={`w-4 h-4 ${timer < 60 ? "animate-spin" : ""}`} />
                  {formatTimer(timer)}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center mt-2">
                <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-400">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Not Active
                </div>
              </div>
            )}
          </div>

          {/* Mode & Status */}
          <div className="bg-zinc-950/80 border border-zinc-850 p-4 rounded-xl shadow-xl space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-555 font-bold uppercase">Room Type</span>
              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${roomInfo?.roomType === "collab" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-rose-400 bg-rose-500/10 border-rose-500/20"}`}>
                {roomInfo?.roomType === "collab" ? "Collab Study" : "PvP Arena"}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-900/60 pt-2">
              <span className="text-[10px] text-zinc-550">Status</span>
              {roomInfo?.roomType === "collab" ? (
                <span className="text-[9px] text-zinc-400 font-bold uppercase bg-zinc-900 px-2 py-0.5 rounded border border-zinc-850">
                  Sync Enabled
                </span>
              ) : battleStarted ? (
                <span className="text-[9px] text-rose-455 font-bold uppercase bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  Battle
                </span>
              ) : (
                <span className="text-[9px] text-zinc-400 font-bold uppercase bg-zinc-900 px-2 py-0.5 rounded border border-zinc-850">
                  Lobby
                </span>
              )}
            </div>

            {roomInfo?.roomType === "battle" && (
              <div className="flex items-center justify-between border-t border-zinc-900/60 pt-2">
                <span className="text-[10px] text-zinc-555 font-bold uppercase">Round Number</span>
                <span className="font-bold font-mono text-zinc-350">
                  Round #{battleStarted ? roundNumber : "—"}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-zinc-900/60 pt-2">
              <span className="text-[10px] text-zinc-555 font-bold uppercase">Spectators Count</span>
              <span className="font-bold font-mono text-zinc-350 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-zinc-500" />
                {spectatorCount}
              </span>
            </div>
          </div>

          {/* Winner Card & Rating Changes */}
          <AnimatePresence>
            {roomInfo?.roomType === "battle" && winner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-zinc-950 border border-amber-500/20 p-4 rounded-xl shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 blur-lg pointer-events-none" />

                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-amber-500 uppercase tracking-wider mb-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Winner Declared
                </div>

                <h4 className="text-sm font-extrabold text-zinc-200 truncate flex items-center gap-1">
                  {winner.name}
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                </h4>

                {/* Rating updates list */}
                {ratingChanges.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-zinc-900 space-y-1.5">
                    <span className="text-[9px] text-zinc-550 font-bold uppercase block tracking-wider">
                      Elo Rating Changes
                    </span>
                    {ratingChanges.map((change, idx) => {
                      const pl = players.find(p => p._id === change.userId) || spectators.find(s => s.userId === change.userId);
                      const isPositive = change.change > 0;
                      return (
                        <div key={idx} className="flex items-center justify-between text-[11px] font-semibold">
                          <span className="text-zinc-400 truncate w-[100px]">
                            {pl?.name || "Player"}
                          </span>
                          <span className={isPositive ? "text-emerald-400" : "text-rose-400"}>
                            {isPositive ? `+${change.change}` : change.change} Elo
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Next round automatic countdown (winner triggers) */}
                {currentUser && winner._id === currentUser._id && nextRoundCountdown > 0 && (
                  <div className="mt-4 pt-2.5 border-t border-amber-500/10 flex items-center justify-between text-[9px] text-amber-450 font-bold">
                    <span>Next round starting...</span>
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 animate-pulse">
                      {nextRoundCountdown}s
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Players List with live coding statuses */}
          <div className="bg-zinc-950/80 border border-zinc-850 p-4 rounded-xl shadow-xl flex flex-col max-h-[220px]">
            <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 shrink-0">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Players ({players.length})
            </span>

            <div className="space-y-2 overflow-y-auto pr-0.5">
              {players.map((player) => {
                const liveStatus = playerLiveStatuses[player._id] || "Coding...";
                const isWinnerColor = winner && winner._id === player._id;

                return (
                  <div
                    key={player._id}
                    className="p-2 bg-zinc-900/60 border border-zinc-850 rounded-lg flex items-center justify-between text-[11px]"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className={`font-bold truncate w-[90px] ${isWinnerColor ? "text-amber-400" : "text-zinc-300"}`}>
                        {player.name}
                      </span>
                      {battleStarted && (
                        <span className="text-[9px] text-zinc-550 truncate w-[90px] mt-0.5 font-medium">
                          {liveStatus}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[9px] font-bold text-zinc-450 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-900 shrink-0">
                      ★ {player.rating ?? 1200}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spectators list */}
          {isSpectator || spectators.length > 0 ? (
            <div className="bg-zinc-950/80 border border-zinc-850 p-4 rounded-xl shadow-xl flex flex-col max-h-[140px]">
              <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider mb-2 flex items-center gap-1.5 shrink-0">
                <Eye className="w-3.5 h-3.5 text-zinc-550" />
                Spectating ({spectators.length})
              </span>
              <div className="space-y-1.5 overflow-y-auto pr-0.5 text-[10px] font-semibold text-zinc-450">
                {spectators.map((s, idx) => (
                  <div key={idx} className="truncate text-zinc-450">
                    • {s.name} <span className="text-zinc-600 font-mono">({s.rating})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Room Chat system */}
          <div className="bg-zinc-950/80 border border-zinc-850 p-4 rounded-xl shadow-xl flex-1 flex flex-col min-h-[220px] overflow-hidden">
            <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 shrink-0">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              Room Chat
            </span>

            {/* Message area */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 mb-2.5 min-h-[100px]">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-zinc-300">{msg.username}</span>
                    <span className="text-[9px] text-zinc-600 font-mono">{msg.timestamp}</span>
                  </div>
                  <p className="text-zinc-450 leading-relaxed font-medium mt-0.5">{msg.text}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSendMessage} className="flex gap-1.5 shrink-0 border-t border-zinc-900 pt-2">
              <input
                type="text"
                placeholder={isSpectator ? "Spectators cannot chat" : "Send message..."}
                disabled={isSpectator}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-850 focus:border-indigo-500/50 rounded-lg text-xs outline-none placeholder-zinc-700 text-zinc-350"
              />
              <button
                type="submit"
                disabled={isSpectator || !chatInput.trim()}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Room;
