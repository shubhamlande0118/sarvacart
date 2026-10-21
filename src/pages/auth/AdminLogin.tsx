import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { useStore } from "../../lib/store";
import { Button, Page } from "../../components/ui";
import { Field } from "./Login";
import BrandLogo from "../../components/BrandLogo";

export default function AdminLogin() {
  const { adminLogin } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await adminLogin(email, password);
    setLoading(false);
    if (ok) navigate("/admin", { replace: true });
  };

  return (
    <Page className="relative flex min-h-screen items-center justify-center px-4 pt-24">
      <div className="aurora absolute inset-0" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass relative w-full max-w-md rounded-3xl border-gold/30 p-8"
      >
<div className="flex items-center gap-3">
          <BrandLogo />
          <div>
            <h1 className="font-serif text-2xl font-bold text-white">Admin Portal</h1>
            <p className="text-xs uppercase tracking-widest text-gold-soft">Restricted access</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <Field icon={Mail}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin email"
              className="w-full bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
            />
          </Field>
          <Field icon={Lock}>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
            />
          </Field>
          <Button type="submit" full size="lg" disabled={loading}>
            {loading ? "Verifying…" : "Enter Dashboard"}
          </Button>
        </form>

        <Link to="/login" className="mt-5 block text-center text-sm text-zinc-400 hover:text-gold-soft">
          ← Back to user login
        </Link>
      </motion.div>
    </Page>
  );
}
