import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "framer-motion";
import { 
  Swords, Users, Play, Code, Cpu, Trophy, ArrowRight, Sparkles, Terminal, Shield, MessageSquare, Flame, CheckCircle, XCircle, ArrowUpRight, Zap, RefreshCw, Activity, Compass, Network
} from "lucide-react";

// 1. Interactive Canvas Grid Background reacting to Mouse movement
function InteractiveCanvasGrid() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const dots = [];
    const spacing = 45;
    const mouse = { x: null, y: null, radius: 140 };

    class Dot {
      constructor(x, y) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
      }
      update() {
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            this.x -= Math.cos(angle) * force * 16;
            this.y -= Math.sin(angle) * force * 16;
          } else {
            this.x += (this.baseX - this.x) * 0.08;
            this.y += (this.baseY - this.y) * 0.08;
          }
        } else {
          this.x += (this.baseX - this.x) * 0.08;
          this.y += (this.baseY - this.y) * 0.08;
        }
      }
      draw() {
        let alpha = 0.06;
        let radius = 0.9;
        let color = "255, 255, 255";

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const ratio = 1 - dist / mouse.radius;
            alpha = 0.06 + ratio * 0.35;
            radius = 0.9 + ratio * 1.5;
            color = "129, 140, 248"; // indigo-400
          }
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${alpha})`;
        ctx.fill();
      }
    }

    const initGrid = () => {
      dots.length = 0;
      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          dots.push(new Dot(x, y));
        }
      }
    };

    initGrid();

    const drawConnections = () => {
      if (mouse.x === null || mouse.y === null) return;
      
      for (let i = 0; i < dots.length; i++) {
        const dx1 = mouse.x - dots[i].x;
        const dy1 = mouse.y - dots[i].y;
        const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

        if (dist1 < mouse.radius) {
          for (let j = i + 1; j < dots.length; j++) {
            const dx2 = mouse.x - dots[j].x;
            const dy2 = mouse.y - dots[j].y;
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

            if (dist2 < mouse.radius) {
              const dotDistX = dots[i].x - dots[j].x;
              const dotDistY = dots[i].y - dots[j].y;
              const dotDist = Math.sqrt(dotDistX * dotDistX + dotDistY * dotDistY);

              if (dotDist < spacing * 1.4) {
                ctx.beginPath();
                ctx.moveTo(dots[i].x, dots[i].y);
                ctx.lineTo(dots[j].x, dots[j].y);
                const force1 = 1 - dist1 / mouse.radius;
                const force2 = 1 - dist2 / mouse.radius;
                const alpha = force1 * force2 * 0.14;
                ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
                ctx.lineWidth = 0.7;
                ctx.stroke();
              }
            }
          }
        }
      }
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initGrid();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw radial halo glow centered on mouse
      if (mouse.x !== null && mouse.y !== null) {
        const glowGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
        glowGrad.addColorStop(0, "rgba(99, 102, 241, 0.06)");
        glowGrad.addColorStop(1, "rgba(99, 102, 241, 0)");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      dots.forEach((d) => {
        d.update();
        d.draw();
      });
      drawConnections();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10" />;
}

// 2. Animated Real-time Socket.io Packets Flow Visualization
function SocketSyncVisualizer() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const eventTemplates = [
      { text: "Socket.io: Emitted 'cursor-move' coordinates", color: "text-indigo-400" },
      { text: "Socket.io: Broadcasted 'sync-code' updates (diff len: +12)", color: "text-amber-500" },
      { text: "Server: Broadcasted lobby active users status", color: "text-emerald-450" },
      { text: "Socket.io: Emitted 'test-case-progress' evaluation stream", color: "text-rose-455" }
    ];

    const interval = setInterval(() => {
      const randomEv = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
      const formatted = {
        id: Math.random().toString(),
        text: randomEv.text,
        color: randomEv.color,
        time: new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
      };
      setLogs((prev) => [formatted, ...prev].slice(0, 4));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#08080a] border border-white/[0.04] p-5 rounded-2.5xl flex flex-col font-mono text-[10.5px] h-[280px]">
      <div className="flex items-center justify-between border-b border-white/[0.03] pb-3 mb-4">
        <span className="text-[9px] text-zinc-650 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Network className="w-3.5 h-3.5 text-indigo-400" />
          Socket.io Sync Telemetry
        </span>
        <span className="text-[8px] text-emerald-450 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">
          LIVE CONNECTED
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 select-none">
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-start gap-2.5"
            >
              <span className="text-zinc-600 shrink-0 font-bold">[{log.time}]</span>
              <span className={`leading-relaxed font-semibold ${log.color}`}>{log.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {logs.length === 0 && (
          <div className="text-zinc-700 h-full flex items-center justify-center font-sans font-bold">
            Waiting for Socket broadcasts...
          </div>
        )}
      </div>
    </div>
  );
}

// 3. Automated 1v1 Battle Arena Simulator
function BattleArenaSimulator() {
  const [phase, setPhase] = useState(0); // 0: coding, 1: running, 2: results
  const [codeA, setCodeA] = useState("");
  const [codeB, setCodeB] = useState("");

  const solA = `int search(vector<int>& num) {\n  int max_so_far = num[0], curr = 0;\n  for (int x : num) {\n    curr = max(x, curr + x);\n    max_so_far = max(max_so_far, curr);\n  }\n  return max_so_far;\n}`;
  const solB = `int search(vector<int>& num) {\n  int sum = 0;\n  for (int x : num) {\n    sum += x; // bug: doesn't find max\n  }\n  return sum;\n}`;

  useEffect(() => {
    let timer;
    if (phase === 0) {
      setCodeA("");
      setCodeB("");
      let count = 0;
      const interval = setInterval(() => {
        setCodeA(solA.substring(0, count));
        setCodeB(solB.substring(0, Math.floor(count * 0.9)));
        count += 3;
        if (count >= solA.length + 5) {
          clearInterval(interval);
          setPhase(1);
        }
      }, 40);
      return () => clearInterval(interval);
    } else if (phase === 1) {
      timer = setTimeout(() => {
        setPhase(2);
      }, 2000);
    } else if (phase === 2) {
      timer = setTimeout(() => {
        setPhase(0);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div className="w-full bg-[#08080a] border border-white/[0.04] rounded-2.5xl shadow-2xl p-5 flex flex-col font-mono text-[11px] h-[310px] relative overflow-hidden">
      
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-white/[0.03] pb-3 mb-4 shrink-0">
        <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Swords className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          Esports Dueling Arena Previews
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-zinc-650 text-[9px] font-bold">Round #2 active</span>
        </div>
      </div>

      <div className="flex-1 flex divide-x divide-white/[0.03] min-h-0">
        {/* Coder A code */}
        <div className="w-1/2 flex flex-col pr-3 overflow-hidden select-none">
          <div className="flex justify-between items-center mb-2.5 text-[9px] text-zinc-650 font-bold">
            <span>Ashutosh (cpp)</span>
            <span className="text-emerald-450">1785 ELO</span>
          </div>
          <pre className="text-zinc-400 font-mono leading-relaxed truncate overflow-y-auto flex-1">{codeA}</pre>
        </div>

        {/* Coder B code */}
        <div className="w-1/2 flex flex-col pl-3 overflow-hidden select-none">
          <div className="flex justify-between items-center mb-2.5 text-[9px] text-zinc-650 font-bold">
            <span>Aman (cpp)</span>
            <span className="text-zinc-550">1732 ELO</span>
          </div>
          <pre className="text-zinc-500 font-mono leading-relaxed truncate overflow-y-auto flex-1">{codeB}</pre>
        </div>
      </div>

      {/* Compiler logs layer overlay */}
      <AnimatePresence>
        {phase === 1 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/85 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-30"
          >
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-indigo-400 font-bold uppercase tracking-wider text-[9.5px]">Sandboxed Judge0 compiler loading...</span>
          </motion.div>
        )}

        {phase === 2 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30"
          >
            <div className="max-w-xs w-full bg-[#08080a] border border-white/[0.04] p-5 rounded-2xl flex flex-col gap-4 text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                <CheckCircle className="w-4 h-4" />
                <span>Ashutosh wins (+24 ELO)</span>
              </div>
              <div className="space-y-1.5 text-[10.5px] font-semibold text-zinc-400 text-left border-y border-white/[0.03] py-3">
                <div className="flex justify-between">
                  <span>Ashutosh rating:</span>
                  <span className="text-emerald-450 font-mono">1809 ELO</span>
                </div>
                <div className="flex justify-between">
                  <span>Aman rating:</span>
                  <span className="text-rose-455 font-mono">1712 ELO</span>
                </div>
              </div>
              <span className="text-[8.5px] text-zinc-650 font-mono">Automatic transition starts</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 4. Collaborative code-sync typing simulator
function CollaborativeIDEPreview() {
  const [code, setCode] = useState("");
  const fullText = `// Collaborating: Ashutosh & Aman\nvoid execute() {\n  // Ashutosh optimized complexity here\n  int value = calculate();\n  printf("Result %d", value);\n}`;

  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      setCode(fullText.substring(0, count));
      count += 2;
      if (count >= fullText.length + 5) {
        count = 0;
      }
    }, 85);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#08080a] border border-white/[0.04] p-5 rounded-2.5xl font-mono text-[11px] h-[260px] relative overflow-hidden flex flex-col">
      <div className="flex items-center justify-between border-b border-white/[0.03] pb-3 mb-4">
        <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          sync-buffer.cpp
        </span>
        <span className="text-[9px] text-emerald-450 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold font-mono">
          2 online
        </span>
      </div>

      <div className="flex-1 overflow-y-auto leading-relaxed select-none text-zinc-500 pr-1 relative">
        <pre className="text-zinc-400">{code}</pre>
        {/* Floating cursor mock labels */}
        <div className="absolute top-8 left-16 px-1.5 py-0.5 bg-indigo-500 text-white font-sans text-[7px] rounded animate-bounce">
          Ashutosh cursor
        </div>
        <div className="absolute bottom-8 right-16 px-1.5 py-0.5 bg-amber-500 text-zinc-950 font-sans text-[7px] rounded animate-bounce">
          Aman typing
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [activeSegment, setActiveSegment] = useState("battle");

  // Scroll depth tracking hook for progress indicator
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 25 });

  const statMetrics = [
    { num: "120k+", label: "Submissions Checked" },
    { num: "24,000+", label: "Active Dueling Coders" },
    { num: "3.2s", label: "Average Compiler Time" },
    { num: "NeetCode 150", label: "Complete Challenges Pool" }
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-150 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Horizontal Scroll progress bar indicator */}
      <motion.div className="fixed top-0 inset-x-0 h-0.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 origin-left z-55" style={{ scaleX }} />

      {/* Interactive canvas grid follow background */}
      <InteractiveCanvasGrid />

      {/* Glowing Mesh accents in background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[380px] rounded-full bg-gradient-to-r from-amber-500/[0.02] to-indigo-500/[0.02] blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] rounded-full bg-gradient-to-r from-rose-500/[0.015] to-violet-500/[0.015] blur-[150px] pointer-events-none" />

      {/* Fixed top glass navigation menu */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.03] bg-zinc-950/60 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 shadow-md shadow-amber-500/10">
            <Swords className="w-4.5 h-4.5 text-white stroke-[2.5]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[14px] font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-rose-455 bg-clip-text text-transparent">
              AlgoSync
            </span>
            <span className="text-[6.5px] text-zinc-650 font-mono tracking-widest uppercase -mt-0.5 font-bold">
              PvP Arena
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-bold text-zinc-450 hover:text-zinc-200 transition-colors">
            Sign In
          </Link>
          <Link to="/signup" className="px-4 py-2 bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] rounded-xl text-xs font-bold text-zinc-200 transition-all shadow-md active:scale-95">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Header Presentation */}
      <section className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 lg:px-12 pt-28 gap-12 max-w-7xl mx-auto w-full z-20">
        
        {/* Left column titles */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6 text-left items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.04] text-[9.5px] font-bold text-zinc-450 uppercase tracking-widest shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Futuristic competitive developer sandbox</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6.5xl font-black tracking-tight leading-[1.06]">
            The Real-time <br/>
            <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 bg-clip-text text-transparent">
              Developer Arena.
            </span>
          </h1>

          <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed max-w-md font-semibold">
            Challenge other developers inside PvP code matchups, coordinate live synchronized pair program editors, and execute test cases inside Judge0 compilations.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto pt-3">
            <Link 
              to="/signup"
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-455 text-zinc-950 font-extrabold text-[12.5px] rounded-2xl shadow-xl active:scale-97 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link 
              to="/login"
              className="w-full sm:w-auto px-6 py-3.5 bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.08] hover:bg-white/[0.04] text-zinc-350 font-bold text-[12.5px] rounded-2xl active:scale-97 transition-all flex items-center justify-center cursor-pointer"
            >
              Enter Lobby
            </Link>
          </div>
        </div>

        {/* Right column animated mockup stack */}
        <div className="w-full lg:w-1/2 relative z-20">
          <BattleArenaSimulator />
        </div>
      </section>

      {/* Feature showcase tabs selectors */}
      <section className="py-24 px-6 max-w-6xl mx-auto space-y-12 relative z-30">
        
        <div className="text-center space-y-3 max-w-lg mx-auto">
          <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-[0.25em]">Designed for PVP Coders</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Handcrafted workspace layers.</h2>
          <p className="text-zinc-550 text-xs sm:text-sm font-medium">
            Switch between the nodes below to inspect the real-time sync systems driving AlgoSync.
          </p>

          <div className="inline-flex p-0.5 rounded-xl bg-white/[0.01] border border-white/[0.04] mt-3">
            {[
              { id: "battle", label: "Battle Arena", icon: Swords },
              { id: "collab", label: "Collab Sync", icon: Users },
              { id: "socket", label: "Socket Sync", icon: Network }
            ].map((seg) => {
              const Icon = seg.icon;
              return (
                <button
                  key={seg.id}
                  onClick={() => setActiveSegment(seg.id)}
                  className={`px-3.5 py-2 text-[10px] font-extrabold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeSegment === seg.id ? "bg-indigo-650 text-white shadow-md shadow-indigo-650/15" : "text-zinc-550 hover:text-zinc-350"}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {seg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic preview cards container */}
        <div className="max-w-2xl mx-auto w-full bg-white/[0.01] p-1 border border-white/[0.03] rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
          <AnimatePresence mode="wait">
            {activeSegment === "battle" && (
              <motion.div
                key="battle"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <div className="p-4 bg-[#08080a] border border-white/[0.04] rounded-2.5xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.03] pb-3 text-xs text-zinc-500">
                    <span className="font-bold">1v1 Esports Match setup</span>
                    <span className="font-mono text-[9px]">Elo ratings update automatically</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-white/[0.01] border border-white/[0.04] p-4.5 rounded-2xl flex flex-col justify-between h-28">
                      <span className="text-[9px] text-zinc-600 font-bold uppercase">Judge0 validations</span>
                      <p className="text-zinc-400 text-[11px] leading-relaxed font-semibold">Automatic Judge0 compilation modules execute solution buffers side-by-side.</p>
                    </div>
                    <div className="bg-white/[0.01] border border-white/[0.04] p-4.5 rounded-2xl flex flex-col justify-between h-28">
                      <span className="text-[9px] text-zinc-600 font-bold uppercase">Round system</span>
                      <p className="text-zinc-400 text-[11px] leading-relaxed font-semibold">Automatic round matching selectors and custom ELO scales update profile achievements.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSegment === "collab" && (
              <motion.div
                key="collab"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <CollaborativeIDEPreview />
              </motion.div>
            )}

            {activeSegment === "socket" && (
              <motion.div
                key="socket"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <SocketSyncVisualizer />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Numeric statistics counts block */}
      <section className="py-20 relative z-30 border-y border-white/[0.03] bg-white/[0.01] overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {statMetrics.map((stat) => (
            <div key={stat.label} className="text-center space-y-1">
              <h4 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-rose-455 bg-clip-text text-transparent font-mono">
                {stat.num}
              </h4>
              <p className="text-zinc-650 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Masonry Review Cards */}
      <section className="py-24 px-6 max-w-5xl mx-auto space-y-14 relative z-30">
        <div className="text-center space-y-3">
          <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-[0.25em]">Developers stories</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Used by competitive developers.</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5 text-left">
          {[
            {
              text: "AlgoSync completely redesigned how I prep for tech interviews. The Esports-like battle timer pressure matches the real interview context.",
              author: "Devon, Software Engineer at Vercel",
              rating: "★ 1940 Elo Expert"
            },
            {
              text: "Working inside the Collaborative Sync buffer editor feels as responsive as Cursor IDE. Perfect tool to debug logic parameters with partners.",
              author: "Sarah, CS undergraduate at Stanford",
              rating: "★ 1765 Elo Specialist"
            }
          ].map((t, idx) => (
            <div key={idx} className="bg-white/[0.01] border border-white/[0.04] p-6 rounded-2.5xl flex flex-col justify-between hover:border-white/[0.08] transition-colors relative overflow-hidden h-40">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-28 h-28 bg-white/[0.01] blur-lg pointer-events-none" />
              <p className="text-zinc-450 text-[11.5px] leading-relaxed font-semibold italic">"{t.text}"</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-[10.5px] font-bold text-zinc-300">{t.author}</span>
                <span className="text-[9.5px] font-mono text-amber-500 font-bold bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">{t.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Conversion panel */}
      <section className="py-32 px-6 text-center max-w-4xl mx-auto relative z-35 space-y-7">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/[0.02] blur-[150px] pointer-events-none" />
        <h2 className="text-3xl sm:text-4.5xl font-black tracking-tight leading-tight">
          Ready to sync and <br/>
          <span className="gradient-text">challenge rival coders?</span>
        </h2>
        <p className="text-zinc-550 text-xs sm:text-sm max-w-md mx-auto font-semibold">
          Create a free sandbox account in seconds, enters lobbies, and climb ranks.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link 
            to="/signup"
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-455 text-zinc-950 font-extrabold text-[12.5px] rounded-2xl shadow-xl active:scale-97 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link 
            to="/login"
            className="w-full sm:w-auto px-6 py-3 bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.08] hover:bg-white/[0.04] text-zinc-300 font-bold text-[12.5px] rounded-2xl active:scale-97 transition-all flex items-center justify-center cursor-pointer"
          >
            Enter Lobby
          </Link>
        </div>
      </section>

      {/* Modern interactive Footer */}
      <footer className="py-12 border-t border-white/[0.03] text-center text-[10px] text-zinc-700 font-mono font-bold tracking-wider relative z-30">
        © 2026 ALGOSYNC PvP NETWORKS. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}
