import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ShoppingBag, User, Search, Shield, LogOut } from "lucide-react";
import { useStore } from "../lib/store";
import { categories } from "../data/seed";
import { cn } from "../utils/cn";
import BrandLogo from "./BrandLogo";

const navLinks = [
  { to: "/", label: "Home" },
  ...categories.map((c) => ({ to: `/shop/${c.slug}`, label: c.name })),
  { to: "/shop", label: "All" },
];

export default function Navbar() {
  const { cartCount, user, isAdmin, logout } = useStore();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/shop?q=${encodeURIComponent(q)}`);
    setOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled ? "glass py-3 shadow-lg" : "bg-transparent py-5"
        )}
>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" aria-label="SarvaCart home">
            <BrandLogo />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium tracking-wide transition-colors hover:text-gold-soft",
                    isActive ? "text-gold-soft" : "text-zinc-300"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <form onSubmit={submitSearch} className="hidden items-center md:flex">
              <div className="glass-light flex items-center gap-2 rounded-full px-3 py-2">
                <Search className="h-4 w-4 text-zinc-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search…"
                  className="w-28 bg-transparent text-sm text-white placeholder-zinc-500 outline-none focus:w-40 transition-all"
                />
              </div>
            </form>

            {isAdmin && (
              <Link
                to="/admin"
                title="Admin"
                className="hidden rounded-full border border-gold/40 p-2.5 text-gold-soft transition hover:bg-gold/10 sm:inline-flex"
              >
                <Shield className="h-5 w-5" />
              </Link>
            )}

            {user ? (
              <div className="hidden items-center gap-1 sm:flex">
                <Link
                  to="/profile"
                  title="Profile"
                  className="rounded-full border border-white/10 p-2.5 text-zinc-200 transition hover:border-gold/40 hover:text-gold-soft"
                >
                  <User className="h-5 w-5" />
                </Link>
                <button
                  onClick={logout}
                  title="Logout"
                  className="rounded-full border border-white/10 p-2.5 text-zinc-200 transition hover:border-red-400/40 hover:text-red-400"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden rounded-full border border-white/10 p-2.5 text-zinc-200 transition hover:border-gold/40 hover:text-gold-soft sm:inline-flex"
                title="Login"
              >
                <User className="h-5 w-5" />
              </Link>
            )}

            <Link to="/cart" className="relative rounded-full border border-white/10 p-2.5 text-zinc-200 transition hover:border-gold/40 hover:text-gold-soft">
              <ShoppingBag className="h-5 w-5" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-[#e8cf8f] to-[#b8860b] px-1 text-[11px] font-bold text-black"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <button
              onClick={() => setOpen(true)}
              className="rounded-full border border-white/10 p-2.5 text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col gap-6 bg-[#0c0c10] p-6"
            >
<div className="flex items-center justify-between">
                <BrandLogo />
                <button onClick={() => setOpen(false)} className="text-zinc-400">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={submitSearch} className="glass-light flex items-center gap-2 rounded-full px-4 py-3">
                <Search className="h-4 w-4 text-zinc-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search products…"
                  className="w-full bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
                />
              </form>

              <nav className="flex flex-col gap-1">
                {navLinks.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === "/"}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "rounded-xl px-4 py-3 text-base font-medium transition",
                        isActive ? "bg-gold/10 text-gold-soft" : "text-zinc-300 hover:bg-white/5"
                      )
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-2 border-t border-white/10 pt-5">
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-zinc-200 hover:bg-white/5">
                      <User className="h-5 w-5" /> {user.name}
                    </Link>
                    <Link to="/orders" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-zinc-200 hover:bg-white/5">
                      <ShoppingBag className="h-5 w-5" /> My Orders
                    </Link>
                    <button onClick={() => { logout(); setOpen(false); }} className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-red-400 hover:bg-white/5">
                      <LogOut className="h-5 w-5" /> Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-zinc-200 hover:bg-white/5">
                    <User className="h-5 w-5" /> Login / Sign up
                  </Link>
                )}
                <Link to="/admin/login" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-gold-soft hover:bg-white/5">
                  <Shield className="h-5 w-5" /> Admin Portal
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
