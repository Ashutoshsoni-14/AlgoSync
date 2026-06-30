import { Link, useNavigate, useLocation } from "react-router-dom";
import { Swords, Trophy, User, LogOut, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem("user")) || null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!userData) return null;

  const links = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
      {/* Brand logo */}
      <Link to="/dashboard" className="flex items-center gap-2 group">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
          <Swords className="w-5.5 h-5.5 text-zinc-950 stroke-[2.2]" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">
            AlgoSync
          </span>
          <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase -mt-1">
            Beta PvP
          </span>
        </div>
      </Link>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-1 bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-800/50">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className="relative px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-tab"
                  className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-zinc-850 rounded-lg border border-zinc-700/30"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-2 ${isActive ? "text-amber-400" : "text-zinc-400 hover:text-zinc-200"}`}>
                <Icon className="w-4.5 h-4.5" />
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* User Stats & Logout */}
      <div className="flex items-center gap-4">
        {/* Rating Badge */}
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800/80">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase leading-none">
              Rating
            </span>
            <span className="text-sm font-bold font-mono text-zinc-200">
              {userData.rating ?? 1200}
            </span>
          </div>
        </div>

        {/* User Card & LogOut */}
        <div className="flex items-center gap-3 border-l border-zinc-800 pl-4">
          <div className="flex flex-col justify-center text-right">
            <span className="text-sm font-semibold text-zinc-300 leading-none">
              {userData.name}
            </span>
            <span className="text-[11px] text-zinc-500 font-mono mt-0.5 leading-none">
              {userData.email}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 active:scale-95 transition-all duration-200"
            title="Log Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
