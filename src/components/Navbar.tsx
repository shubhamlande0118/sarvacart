import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ShoppingBag, User, Search, Shield, LogOut } from "lucide-react";
import { useStore } from "../lib/store";
import { cn } from "../utils/cn";
import BrandLogo from "./BrandLogo";

const navLinks = [
  { key: "home", to: "/", label: "Home" },
  { key: "shop", to: "/shop", label: "Shop" },
  { key: "categories", to: "/", label: "Categories" },
];

export default function Navbar() {
  const { cartCount, user, isAdmin, logout } = useStore();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleCategoriesClick = (e?: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("categories");
    if (location.pathname === "/") {
      e?.preventDefault();
      setOpen(false);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setOpen(false);
    navigate("/");
    setTimeout(() => {
      document.getElementById("categories")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

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
         scrolled
           ? "border-b border-[#e8ddd2] bg-[rgba(255,255,255,0.78)] py-3 shadow-[0_12px_30px_-26px_rgba(28,25,23,0.4)] backdrop-blur-xl"
           : "bg-transparent py-5"
  )}
>
  <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
         <Link to="/" aria-label="SarvaCart home" className="flex items-center">
           <BrandLogo className="scale-[1.15]" imgClassName="h-10 w-10 sm:h-11 sm:w-11" />
         </Link>

         <nav className="hidden items-center gap-7 lg:flex">
           {navLinks.map((l) => (
             <NavLink
               key={l.key}
               to={l.to}
               end={l.to === "/"}
               onClick={l.key === "categories" ? handleCategoriesClick : undefined}
               className={({ isActive }) =>
                 cn(
                   "text-sm font-medium tracking-[0.08em] text-[#584d47] transition-colors hover:text-[#b8733b]",
                   isActive && "text-[#b8733b]"
                 )
               }
             >
               {l.label}
             </NavLink>
           ))}
         </nav>

         <div className="hidden items-center gap-6 lg:flex">
           <Link to={user ? "/profile" : "/login"} className="text-sm font-medium tracking-[0.08em] text-[#584d47] transition hover:text-[#b8733b]">
             Account
           </Link>
           <Link to="/cart" className="text-sm font-medium tracking-[0.08em] text-[#584d47] transition hover:text-[#b8733b]">
             Cart
           </Link>
         </div>

         <div className="flex items-center gap-2 sm:gap-3">
           <form onSubmit={submitSearch} className="hidden items-center md:flex">
             <div className="glass-light flex items-center gap-2 rounded-full px-3 py-2">
               <Search className="h-4 w-4 text-[#7c6b63]" />
               <input
                 value={q}
                 onChange={(e) => setQ(e.target.value)}
                 placeholder="Search…"
                 className="w-28 bg-transparent text-sm text-[#1c1917] placeholder:text-[#81756f] outline-none transition-all focus:w-40"
               />
             </div>
           </form>

           {isAdmin && (
             <Link
               to="/admin"
               title="Admin"
               className="hidden rounded-full border border-[#d9b18b] bg-[#fff7f2] p-2.5 text-[#b8733b] transition hover:bg-[#fbeee4] sm:inline-flex"
             >
               <Shield className="h-5 w-5" />
             </Link>
           )}

           {user ? (
             <div className="hidden items-center gap-1 sm:flex">
               <Link
                 to="/profile"
                 title="Profile"
                 className="rounded-full border border-[#e2d8d1] bg-white/80 p-2.5 text-[#352f2d] transition hover:border-[#d9b18b] hover:text-[#b8733b]"
               >
                 <User className="h-5 w-5" />
               </Link>
               <button
                 onClick={logout}
                 title="Logout"
                 className="rounded-full border border-[#e2d8d1] bg-white/80 p-2.5 text-[#352f2d] transition hover:border-red-200 hover:text-red-500"
               >
                 <LogOut className="h-5 w-5" />
               </button>
             </div>
           ) : (
             <Link
               to="/login"
               className="hidden rounded-full border border-[#e2d8d1] bg-white/80 p-2.5 text-[#352f2d] transition hover:border-[#d9b18b] hover:text-[#b8733b] sm:inline-flex"
               title="Login"
             >
               <User className="h-5 w-5" />
             </Link>
           )}

           <Link
             to="/cart"
             className="relative rounded-full border border-[#e2d8d1] bg-white/80 p-2.5 text-[#352f2d] transition hover:border-[#d9b18b] hover:text-[#b8733b]"
           >
             <ShoppingBag className="h-5 w-5" />
             <AnimatePresence>
               {cartCount > 0 && (
                 <motion.span
                   key={cartCount}
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   exit={{ scale: 0 }}
                   className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-[#e8cf8f] to-[#b8733b] px-1 text-[11px] font-bold text-[#fffdfb]"
                 >
                   {cartCount}
                 </motion.span>
               )}
             </AnimatePresence>
           </Link>

           <button
             onClick={() => setOpen(true)}
             className="rounded-full border border-[#e2d8d1] bg-white/80 p-2.5 text-[#352f2d] lg:hidden"
           >
             <Menu className="h-5 w-5" />
           </button>
         </div>
  </div>
</header>

<AnimatePresence>
  {open && (
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[60] lg:hidden"
         >
           <div className="absolute inset-0 bg-[#1a1716]/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
           <motion.div
             initial={{ x: "100%" }}
             animate={{ x: 0 }}
             exit={{ x: "100%" }}
             transition={{ type: "spring", damping: 28, stiffness: 240 }}
             className="absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col gap-6 bg-[#fffaf5] p-6 shadow-2xl"
           >
             <div className="flex items-center justify-between">
               <BrandLogo />
               <button onClick={() => setOpen(false)} className="text-[#605752]">
                 <X className="h-6 w-6" />
               </button>
             </div>

             <form onSubmit={submitSearch} className="glass-light flex items-center gap-2 rounded-full px-4 py-3">
               <Search className="h-4 w-4 text-[#786d67]" />
               <input
                 value={q}
                 onChange={(e) => setQ(e.target.value)}
                 placeholder="Search products…"
                 className="w-full bg-transparent text-sm text-[#1c1917] placeholder:text-[#81756f] outline-none"
               />
             </form>

             <nav className="flex flex-col gap-1">
               {navLinks.map((l) => (
                 <NavLink
                   key={l.key}
                   to={l.to}
                   end={l.to === "/"}
                   onClick={l.key === "categories" ? handleCategoriesClick : () => setOpen(false)}
                   className={({ isActive }) =>
                     cn(
                       "rounded-xl px-4 py-3 text-base font-medium transition",
                       isActive ? "bg-[#f9eee4] text-[#b8733b]" : "text-[#4f4844] hover:bg-[#f6f1ed]"
                     )
                   }
                 >
                   {l.label}
                 </NavLink>
               ))}
             </nav>

             <div className="mt-auto flex flex-col gap-2 border-t border-[#ebe1d7] pt-5">
               {user ? (
                 <>
                   <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-[#352f2d] hover:bg-[#f7f1eb]">
                     <User className="h-5 w-5" /> {user.name}
                   </Link>
                   <Link to="/orders" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-[#352f2d] hover:bg-[#f7f1eb]">
                     <ShoppingBag className="h-5 w-5" /> My Orders
                   </Link>
                   <button onClick={() => { logout(); setOpen(false); }} className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-red-500 hover:bg-red-50">
                     <LogOut className="h-5 w-5" /> Logout
                   </button>
                 </>
               ) : (
                 <Link to="/login" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-[#352f2d] hover:bg-[#f7f1eb]">
                   <User className="h-5 w-5" /> Login / Sign up
                 </Link>
               )}
               <Link to="/admin/login" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-[#b8733b] hover:bg-[#f9eee4]">
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
