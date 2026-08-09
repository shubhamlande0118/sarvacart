import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useStore } from "../../lib/store";
import { Button, Page } from "../../components/ui";
import { cn } from "../../utils/cn";
import BrandLogo from "../../components/BrandLogo";

export default function Login() {
  const { login } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) navigate(from, { replace: true });
  };

  return (
    <Page className="relative flex min-h-screen items-center justify-center px-4 pt-24">
      <div className="aurora absolute inset-0" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass relative w-full max-w-md rounded-3xl p-8"
      >
<div className="flex items-center gap-2">
          <BrandLogo />
        </div>
        <h1 className="mt-6 font-serif text-3xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-zinc-400">Sign in to continue your curation.</p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <Field icon={Mail}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
            />
          </Field>
          <Field icon={Lock}>
            <input
              type={show ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="text-zinc-500">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </Field>
          <Button type="submit" full size="lg" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          New to SarvaCart?{" "}
          <Link to="/signup" className="text-gold-soft hover:underline">Create an account</Link>
        </p>
        <Link
          to="/admin/login"
          className="mt-3 block text-center text-xs uppercase tracking-widest text-zinc-500 hover:text-gold-soft"
        >
          Admin portal →
        </Link>
      </motion.div>
    </Page>
  );
}

export function Field({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 transition focus-within:border-gold/50")}>
      <Icon className="h-4 w-4 shrink-0 text-zinc-400" />
      {children}
    </div>
  );
}
