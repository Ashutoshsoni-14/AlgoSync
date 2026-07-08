import { useState } from "react";
import { registerUser } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { Swords, User, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Trophy, Users, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (errorMsg) setErrorMsg("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        try {
            const data = await registerUser(formData);
            localStorage.setItem("user", JSON.stringify(data));
            navigate("/dashboard");
        } catch (error) {
            const msg = error.response?.data?.message || "Registration failed. Please try again.";
            console.log(msg);
            setErrorMsg(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#070709] text-zinc-150 overflow-hidden font-sans">
            
            {/* LEFT SIDE: Branding & Features section */}
            <div className="w-full md:w-1/2 relative bg-zinc-950 border-r border-zinc-900 flex flex-col justify-between p-12 overflow-hidden shrink-0">
                
                {/* Background ambient light */}
                <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-rose-500/5 blur-[150px] pointer-events-none" />

                {/* Header Brand */}
                <Link to="/" className="flex items-center gap-2 group relative z-10">
                    <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-rose-500 shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
                        <Swords className="w-5 h-5 text-zinc-950 stroke-[2.2]" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-rose-455 bg-clip-text text-transparent">
                            AlgoSync
                        </span>
                        <span className="text-[9px] text-zinc-650 font-mono tracking-widest uppercase -mt-1 leading-none font-bold">
                            Beta PvP
                        </span>
                    </div>
                </Link>

                {/* Slogan & Core Features */}
                <div className="relative z-10 max-w-md my-auto space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-zinc-100">
                            The Ultimate Arena for Algorithm Duels.
                        </h2>
                        <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                            Compete against coders globally, climb the ranks, and sharpen your logic under pressure on the top 150 interview problems.
                        </p>
                    </div>

                    <div className="space-y-5">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                                <Swords className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-zinc-200">1v1 Code Battles</h4>
                                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed font-medium">Compete privately without code mirroring. First accepted solution wins.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-550 shrink-0">
                                <Trophy className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-zinc-200">ELO Rating System</h4>
                                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed font-medium">Auto-scaling rating matching. Earn details and badges for each win.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-center text-rose-455 shrink-0">
                                <Eye className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-zinc-200">Spectator Mode & Chat</h4>
                                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed font-medium">Watch live coders, participate in room chat, and inspect submission histories.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Brand Info */}
                <div className="text-[10px] text-zinc-650 font-mono font-bold tracking-wider relative z-10">
                    © 2026 ALGOSYNC SYSTEMS. ALL RIGHTS RESERVED.
                </div>
            </div>

            {/* RIGHT SIDE: Authentication Form Panel */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-hidden">
                <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md bg-zinc-950/40 border border-zinc-900 rounded-2xl p-8 shadow-2xl relative z-10"
                >
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
                            Create Account
                        </h1>
                        <p className="text-xs text-zinc-500 mt-1.5 font-medium">
                            Join the PvP coding network and enter matches.
                        </p>
                    </div>

                    {/* Error Alert */}
                    <AnimatePresence>
                        {errorMsg && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mb-6"
                            >
                                <div className="flex items-center gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider pl-1">
                                User Name / Handle
                            </label>
                            <div className="relative group">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    placeholder="e.g. Alice"
                                    onChange={handleChange}
                                    className="w-full pl-10.5 pr-4 py-3 bg-zinc-900/40 border border-zinc-850 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 rounded-xl text-xs text-zinc-250 placeholder-zinc-700 outline-none transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider pl-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    placeholder="coder@arena.com"
                                    onChange={handleChange}
                                    className="w-full pl-10.5 pr-4 py-3 bg-zinc-900/40 border border-zinc-850 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 rounded-xl text-xs text-zinc-250 placeholder-zinc-700 outline-none transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider pl-1">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    value={formData.password}
                                    placeholder="••••••••"
                                    onChange={handleChange}
                                    className="w-full pl-10.5 pr-11 py-3 bg-zinc-900/40 border border-zinc-850 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 rounded-xl text-xs text-zinc-250 placeholder-zinc-700 outline-none transition-all duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="relative w-full py-3 px-4 mt-2 rounded-xl bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-400 hover:to-rose-400 text-zinc-950 font-bold text-xs shadow-lg shadow-indigo-500/10 hover:shadow-indigo-400/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer redirect */}
                    <div className="mt-8 text-center text-xs text-zinc-500 font-medium">
                        Already have an account?{" "}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline transition-colors ml-1">
                            Sign In
                        </Link>
                    </div>
                </motion.div>
            </div>

        </div>
    );
}

export default Signup;